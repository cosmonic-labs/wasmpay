package main

import (
	"bytes"
	"context"
	"embed"
	"encoding/json"
	"fmt"
	"io"
	"io/fs"
	"log/slog"
	"net/http"
	"strings"

	// Generated interfaces

	"github.com/cosmonic-labs/wasmpay/api-gateway/gen/wasi/config/runtime"
	"github.com/cosmonic-labs/wasmpay/api-gateway/gen/wasmcloud/identity/store"
	"github.com/cosmonic-labs/wasmpay/api-gateway/gen/wasmpay/platform/types"
	"github.com/cosmonic-labs/wasmpay/api-gateway/gen/wasmpay/platform/validation"
	"github.com/cosmonic-labs/wasmpay/aws"
	"github.com/cosmonic-labs/wasmpay/aws/config"
	"github.com/cosmonic-labs/wasmpay/aws/credentials"
	"github.com/cosmonic-labs/wasmpay/aws/services/bedrockruntime"
	brtypes "github.com/cosmonic-labs/wasmpay/aws/services/bedrockruntime/types"
	"github.com/cosmonic-labs/wasmpay/aws/services/sts"
	"github.com/julienschmidt/httprouter"
	"go.wasmcloud.dev/component/log/wasilog"
)

//go:embed static/dist/*
var staticAssets embed.FS

const (
	ModelAmazonNovaMicro      = "us.amazon.nova-micro-v1:0"
	ModelAmazonNovaLite       = "us.amazon.nova-lite-v1:0"
	ModelAnthropicClaudeHaiku = "us.anthropic.claude-3-5-haiku-20241022-v1:0"
	defaultRegion             = "us-east-2"
	defaultAPIGatewayAudience = "spiffe://aws.amazon.com/wasmpay/api-gateway"
	defaultRoleArn            = "arn:aws:iam::471112507838:role/wasmpay-api-gateway"
	bankBackendConfigKey      = "bank_backend_url"
	defaultBankBackendURL     = "http://127.0.0.1:8080"
	wasmPayProFeature         = "X-Wasmpay-Pro"
	wasmPayStoreOnFail        = "X-WasmPay-Persist-Denied"
)

// Router creates a [http.Handler] and registers the application-specific
// routes with their respective handlers for the application.
func Router() http.Handler {
	router := httprouter.New()

	// Helper to know when the server is up
	router.GET("/healthz", healthzHandler)
	// Send request to bedrock (WIP)
	router.POST("/api/v1/bedrock", bedrockHandler)
	// Send requests to the LLM for translation
	router.POST("/api/v1/chat", chatHandler)
	// Send request to identity store to fetch a JWT-SVID
	router.POST("/api/v1/token", tokenHandler)

	// Send request to the backend to manage banks
	router.GET("/api/v1/banks", getBankHandler)
	router.DELETE("/api/v1/banks", deleteBankHandler)
	router.POST("/api/v1/banks", createBankHandler)

	// Send request to the backend to manage transactions
	router.GET("/api/v1/transactions", getTransactionsHandler)
	// Send requests to LLM for fraud detection, then kick off transaction
	router.POST("/api/v1/transactions", createTransactionHandler)

	// Handling assets
	router.GET("/", assetHandler)
	router.GET("/config.json", assetHandler)
	router.GET("/favicon.ico", assetHandler)
	router.GET("/assets/*asset", assetHandler)
	router.GET("/images/*image", assetHandler)
	return router
}

func createTransactionHandler(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	var request types.Transaction
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		errorResponse(w, "Invalid request body"+err.Error(), http.StatusBadRequest)
		return
	}

	// Ensure the request is not a zero value
	if request == (types.Transaction{}) {
		errorResponse(w, "Request cannot be empty or zero value", http.StatusBadRequest)
		return
	}

	logger := slog.New(wasilog.DefaultOptions().NewHandler())

	proFeature := r.Header.Get("X-Wasmpay-Pro")
	if proFeature != "" {
		ctx := r.Context()
		// TODO: AI detect fraud
		logger.Info("Validated transaction as non-fraudlent, sending for processing")
		workloadIdentityToken, err := fetchWorkloadIdentity()
		if err != nil {
			logger.Error("failed to load JWT from identity service", "error", err)
			errorResponse(w, "Wasmpay Pro feature is currently unavailable, please try again later. (error-001)", http.StatusBadRequest)
			return
		}

		creds, err := exchangeWorkloadIdentityForCredentials(ctx, workloadIdentityToken)
		if err != nil {
			logger.Error("failed to load aws config for sts", "error", err)
			errorResponse(w, "Wasmpay Pro feature is currently unavailable, please try again later. (error-002)", http.StatusBadRequest)
			return
		}

		// <insert-AI-logic-here>
		cfg, err := config.LoadDefaultConfig(ctx, config.WithHTTPClient(httpClient), config.WithRegion(defaultRegion), config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(creds.AccessKeyID, creds.SecretAccessKey, creds.SessionToken)))
		if err != nil {
			logger.Error("failed to load AWS config for Bedrock Runtime", "error", err)
			errorResponse(w, "Wasmpay Pro feature is currently unavailable, please try again later. (error-003)", http.StatusBadRequest)
			return
		}

		client := bedrockruntime.NewFromConfig(cfg)
		responses, err := client.Converse(ctx, &bedrockruntime.ConverseInput{
			ModelId: ModelAmazonNovaLite,
			InferenceConfig: &brtypes.InferenceConfiguration{
				MaxTokens:   300,
				Temperature: 0.3,
				TopP:        0.1,
			},
			Messages: []brtypes.Message{
				{
					Content: []brtypes.ContentBlockMemberText{
						{
							Value: "Write a short story about dragons",
						},
					},
					Role: brtypes.ConversationRoleUser,
				},
			},
			System: []brtypes.SystemContentBlockMemberText{
				{
					Value: "You are a helpful assistant",
				},
			},
		})
		if err != nil {
			logger.Error("failed to invoke model from bedrock", "error", err)
			errorResponse(w, "Wasmpay Pro feature is currently unavailable, please try again later. (error-004)", http.StatusBadRequest)
			return
		}

		// Act on the AI response
		for _, response := range responses.Output.Value.Content {
			fmt.Printf("The AI said: %s\n", response.Value)
		}

		// </insert-AI-logic-here>
	}

	transactionManagerResponse := validation.Validate(request)
	// Backend transaction type
	type Transaction struct {
		ID          string `json:"id,omitempty"`
		Amount      string `json:"amount"`
		Currency    string `json:"currency"`
		Origin      string `json:"origin"`
		Destination string `json:"destination"`
		Status      string `json:"status"`
		Reason      string `json:"reason"`
	}

	var backendRequest Transaction
	if transactionManagerResponse.Approved {
		backendRequest = Transaction{
			Amount:      fmt.Sprintf("%d", request.Amount),
			Currency:    request.Currency,
			Origin:      request.Origin.Code,
			Destination: request.Destination.Code,
			Status:      "approved",
			Reason:      "",
		}
	} else {
		// Allow configuration to store transactions even if they are denied
		storeOnFail := r.Header.Get(wasmPayStoreOnFail)
		if storeOnFail == "" {
			errorResponse(w, fmt.Sprintf("Transaction failed validation: %s", *transactionManagerResponse.Reason.Some()), http.StatusOK)
			return
		} else {
			backendRequest = Transaction{
				Amount:      fmt.Sprintf("%d", request.Amount),
				Currency:    request.Currency,
				Origin:      request.Origin.Code,
				Destination: request.Destination.Code,
				Status:      "denied",
				Reason:      *transactionManagerResponse.Reason.Some(),
			}
		}
	}

	// Send the request to the backend
	requestBytes, err := json.Marshal(backendRequest)
	if err != nil {
		errorResponse(w, "Failed to marshal request to JSON", http.StatusInternalServerError)
		return
	}
	url := backend("TransactionService", "StoreTransaction")
	resp, err := httpClient.Post(url, "application/json", bytes.NewReader(requestBytes))
	if err != nil {
		errorResponse(w, fmt.Sprintf("Failed to create transaction: %v", err), http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		http.Error(w, string(body), resp.StatusCode)
		return
	}
	// Decode the response which should just contain the ID

	type CreateTransactionResponse struct {
		ID string `json:"id"`
	}
	var createTransactionResponse CreateTransactionResponse
	if err := json.NewDecoder(resp.Body).Decode(&createTransactionResponse); err != nil {
		errorResponse(w, "Failed to decode create transaction response", http.StatusInternalServerError)
		return
	}
	// Return the response
	successResponse(w, createTransactionResponse)
}

func getTransactionsHandler(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	url := backend("TransactionService", "ListTransactions")

	resp, err := httpClient.Post(url, "application/json", bytes.NewReader([]byte("{}")))
	if err != nil {
		errorResponse(w, fmt.Sprintf("Failed to fetch transactions: %v", err), http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		http.Error(w, string(body), resp.StatusCode)
		return
	}

	// Backend transaction type
	type Transaction struct {
		ID          string `json:"id,omitempty"`
		Amount      string `json:"amount"`
		Currency    string `json:"currency"`
		Origin      string `json:"origin"`
		Destination string `json:"destination"`
		Status      string `json:"status"`
		Reason      string `json:"reason"`
	}
	type TransactionResponse struct {
		Transactions []Transaction `json:"transactions"`
	}
	var transactions TransactionResponse
	if err := json.NewDecoder(resp.Body).Decode(&transactions); err != nil {
		errorResponse(w, "Failed to decode transactions response", http.StatusInternalServerError)
		return
	}

	// Return the transactions
	successResponse(w, transactions.Transactions)
}

func deleteBankHandler(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	code := r.FormValue("code")
	if code == "" {
		errorResponse(w, "Missing bank code", http.StatusBadRequest)
		return
	}

	url := backend("BankService", "DeleteBank")
	body := fmt.Sprintf(`{"code": "%s"}`, code)

	resp, err := httpClient.Post(url, "application/json", strings.NewReader(body))
	if err != nil {
		errorResponse(w, fmt.Sprintf("Failed to delete bank: %v", err), http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		responseBody, _ := io.ReadAll(resp.Body)
		http.Error(w, string(responseBody), resp.StatusCode)
		return
	}

	successResponse(w, "Bank deleted successfully")
}

func createBankHandler(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	var request types.Bank
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		errorResponse(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Ensure the request is not a zero value
	if request == (types.Bank{}) {
		errorResponse(w, "Request cannot be empty or zero value", http.StatusBadRequest)
		return
	}

	// Ensure the request has a code, name, currency, and country
	if request.Code == "" || request.Name == "" || request.Currency == "" || request.Country == "" {
		errorResponse(w, "Request must contain code, name, currency, and country", http.StatusBadRequest)
		return
	}

	// Send the request to the backend
	url := backend("BankService", "CreateBank")
	requestBytes, err := json.Marshal(request)
	if err != nil {
		errorResponse(w, "Failed to marshal request to JSON", http.StatusInternalServerError)
		return
	}

	resp, err := httpClient.Post(url, "application/json", bytes.NewReader(requestBytes))

	if err != nil {
		errorResponse(w, fmt.Sprintf("Failed to create bank: %v", err), http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		http.Error(w, string(body), resp.StatusCode)
		return
	}

	// Decode the response
	type CreateBankResponse struct {
		ID string `json:"id"`
	}

	var createBankResponse CreateBankResponse
	if err := json.NewDecoder(resp.Body).Decode(&createBankResponse); err != nil {
		errorResponse(w, "Failed to decode create bank response", http.StatusInternalServerError)
		return
	}

	// Return the response
	successResponse(w, createBankResponse)
}

func getBankHandler(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	var url string
	var body []byte

	// Determine if we should query by code, id, or list all banks
	code := r.FormValue("code")
	if code != "" {
		url = backend("BankService", "GetBank")
		body = fmt.Appendf(body, `{"code": "%s"}`, code)
	}
	id := r.FormValue("id")
	if id != "" {
		url = backend("BankService", "GetBank")
		body = fmt.Appendf(body, `{"id": "%s"}`, id)
	}
	if url == "" {
		url = backend("BankService", "ListBanks")
		body = []byte("{}")
	}

	resp, err := httpClient.Post(url, "application/json", bytes.NewReader(body))

	if err != nil {
		errorResponse(w, fmt.Sprintf("Failed to fetch banks: %v", err), http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		http.Error(w, string(body), resp.StatusCode)
		return
	}

	// List requests return an array
	// Get requests return a single object
	type BankResponse struct {
		Banks []types.Bank `json:"banks"`
		Bank  types.Bank   `json:"bank"`
	}
	var bankResponse BankResponse
	if err := json.NewDecoder(resp.Body).Decode(&bankResponse); err != nil {
		errorResponse(w, "Failed to decode banks response", http.StatusInternalServerError)
		return
	}
	if strings.Contains(url, "ListBanks") {
		successResponse(w, bankResponse.Banks)
	} else {
		successResponse(w, bankResponse.Bank)
	}
}

type TokenRequest struct {
	Audience string `json:"audience,omitempty"`
}

func tokenHandler(w http.ResponseWriter, r *http.Request, params httprouter.Params) {
	logger := wasilog.ContextLogger("token-handler")

	var req TokenRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		logger.Error("failed to decode request", "error", err)
		errorResponse(w, "Failed to decode request.", http.StatusBadRequest)
		return
	}
	audience := req.Audience

	result := store.Get(audience)
	resultOk := result.OK()
	if resultOk == nil {
		logger.Error("failed to load JWT from identity service", "error", result.Err())
		errorResponse(w, "Failed to load JWT.", http.StatusBadRequest)
		return
	}
	token := resultOk.Value()

	successResponse(w, token)
}

type BedrockRequest struct {
	RoleArn string `json:"role_arn,omitempty"`
	Region  string `json:"region,omitempty"`
	Token   string `json:"token,omitempty"`
}

func bedrockHandler(w http.ResponseWriter, r *http.Request, params httprouter.Params) {
	ctx := context.Background()
	logger := wasilog.ContextLogger("bedrock-handler")

	var req BedrockRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		logger.Error("failed to decode request", "error", err)
		errorResponse(w, "Failed to decode request.", http.StatusBadRequest)
		return
	}
	roleArn := req.RoleArn
	token := req.Token
	region := req.Region
	if region == "" {
		region = defaultRegion
	}

	stsCfg, err := config.LoadDefaultConfig(ctx, config.WithHTTPClient(httpClient), config.WithRegion(region))
	if err != nil {
		logger.Error("failed to load aws config for sts", "error", err)
		errorResponse(w, "Failed to load AWS config for STS", http.StatusBadRequest)
		return
	}

	stsClient := sts.NewFromConfig(stsCfg)
	stsOut, err := stsClient.AssumeRoleWithWebIdentity(ctx, &sts.AssumeRoleWithWebIdentityInput{
		RoleArn:          roleArn,
		RoleSessionName:  "greetings-from-go",
		DurationSeconds:  900,
		WebIdentityToken: token,
	})
	if err != nil {
		logger.Error("failed to assume role", "error", err)
		errorResponse(w, "Failed to assume role.", http.StatusBadRequest)
		return
	}

	brCfg, err := config.LoadDefaultConfig(ctx, config.WithHTTPClient(httpClient), config.WithRegion(region), config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(stsOut.Credentials.AccessKeyID, stsOut.Credentials.SecretAccessKey, stsOut.Credentials.SessionToken)))
	if err != nil {
		logger.Error("failed to load AWS config for Bedrock Runtime", "error", err)
		errorResponse(w, "Failed to load AWS config for Bedrock Runtime", http.StatusBadRequest)
		return
	}

	brClient := bedrockruntime.NewFromConfig(brCfg)
	brOut, err := brClient.Converse(ctx, &bedrockruntime.ConverseInput{
		ModelId: ModelAmazonNovaLite,
		InferenceConfig: &brtypes.InferenceConfiguration{
			MaxTokens:   300,
			Temperature: 0.3,
			TopP:        0.1,
		},
		Messages: []brtypes.Message{
			{
				Content: []brtypes.ContentBlockMemberText{
					{
						Value: "Write a short story about dragons",
					},
				},
				Role: brtypes.ConversationRoleUser,
			},
		},
		System: []brtypes.SystemContentBlockMemberText{
			{
				Value: "You are a helpful assistant",
			},
		},
	})
	if err != nil {
		logger.Error("failed to invoke model from bedrock", "error", err)
		errorResponse(w, "Failed to invoke model", http.StatusBadRequest)
		return
	}

	successResponse(w, brOut)
}

type ChatRequest struct {
	SourceLang string `json:"source_lang"`
	TargetLang string `json:"target_lang"`
	Text       string `json:"text"`
}

// Expect '{"source_lang": "en", "target_lang": "es", "text": "Hello, world!"}'
func chatHandler(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	var request ChatRequest
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		errorResponse(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	prompt := fmt.Sprintf("Translate the following text from %s to %s: \"%s\"", request.SourceLang, request.TargetLang, request.Text)

	// TODO: AI EXECUTE
	logger := slog.New(wasilog.DefaultOptions().NewHandler())
	logger.Info(fmt.Sprintf("Translating text %s", prompt))
	response := "Hola, mundo!" // Placeholder for the actual translation response
	successResponse(w, response)
}

func healthzHandler(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	// TODO: try and healthz the transaction manager, aws conn, etc
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("OK"))
}

func assetHandler(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	assets, err := fs.Sub(staticAssets, "static/dist")
	if err != nil {
		errorResponse(w, "Couldn't find static assets", http.StatusInternalServerError)
		return
	}
	fs := http.FileServer(http.FS(assets))
	http.StripPrefix("/", fs).ServeHTTP(w, r)
}

type SuccessResponse struct {
	Data any `json:"data"`
}

// Send a successful HTTP response, encoding the data under a nested field
func successResponse(w http.ResponseWriter, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(SuccessResponse{Data: data})
}

type ErrorResponse struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

func errorResponse(w http.ResponseWriter, message string, httpCode int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(httpCode)
	json.NewEncoder(w).Encode(ErrorResponse{
		Code:    "gateway_error",
		Message: message,
	})
}

func fetchWorkloadIdentity() (string, error) {
	// TODO(joonas): Should this be configurable from the request?
	result := store.Get(defaultAPIGatewayAudience)
	token := result.OK()
	if token == nil {
		return "", fmt.Errorf("failed to load JWT from identity service: %w", result.Err())
	}
	return token.Value(), nil
}

func exchangeWorkloadIdentityForCredentials(ctx context.Context, token string) (aws.Credentials, error) {
	cfg, err := config.LoadDefaultConfig(ctx, config.WithHTTPClient(httpClient), config.WithRegion(defaultRegion))
	if err != nil {
		return aws.Credentials{}, err
	}

	client := sts.NewFromConfig(cfg)
	out, err := client.AssumeRoleWithWebIdentity(ctx, &sts.AssumeRoleWithWebIdentityInput{
		RoleArn:          defaultRoleArn,
		RoleSessionName:  "apigateway-request",
		DurationSeconds:  900,
		WebIdentityToken: token,
	})
	if err != nil {
		return aws.Credentials{}, err
	}

	return aws.Credentials{
		AccessKeyID:     out.Credentials.AccessKeyID,
		SecretAccessKey: out.Credentials.SecretAccessKey,
		SessionToken:    out.Credentials.SessionToken,
	}, nil
}

// Helper function to get the backend URL from the runtime config
// or fallback to local
func backend(service string, path string) string {
	url, _, err := runtime.Get(bankBackendConfigKey).Result()
	if err || url.None() {
		return fmt.Sprintf("%s/api.ledger.v1.%s/%s", defaultBankBackendURL, service, path)
	}
	return fmt.Sprintf("%s/api.ledger.v1.%s/%s", url.Value(), service, path)
}
