package main

import (
	"context"
	"embed"
	"encoding/json"
	"fmt"
	"io/fs"
	"log/slog"
	"net/http"

	// Generated interfaces

	"github.com/cosmonic-labs/wasmpay/api-gateway/gen/wasmcloud/identity/store"
	"github.com/cosmonic-labs/wasmpay/api-gateway/gen/wasmpay/platform/types"
	"github.com/cosmonic-labs/wasmpay/api-gateway/gen/wasmpay/platform/validation"
	"github.com/cosmonic-labs/wasmpay/aws/config"
	"github.com/cosmonic-labs/wasmpay/aws/credentials"
	"github.com/cosmonic-labs/wasmpay/aws/services/bedrockruntime"
	brtypes "github.com/cosmonic-labs/wasmpay/aws/services/bedrockruntime/types"
	"github.com/cosmonic-labs/wasmpay/aws/services/sts"
	"github.com/julienschmidt/httprouter"
	"go.wasmcloud.dev/component/log/wasilog"
)

//go:embed wasmcloud.banking/client/apps/banking/dist/*
var staticAssets embed.FS

const (
	ModelAmazonNovaMicro      = "us.amazon.nova-micro-v1:0"
	ModelAmazonNovaLite       = "us.amazon.nova-lite-v1:0"
	ModelAnthropicClaudeHaiku = "us.anthropic.claude-3-5-haiku-20241022-v1:0"
	defaultRegion             = "us-east-2"
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
	// Send requests to LLM for fraud detection, then kick off transaction
	router.POST("/api/v1/transaction", transactionHandler)
	// Send request to identity store to fetch a JWT-SVID
	router.POST("/api/v1/token", tokenHandler)
	// router.POST("/accounts/:id", newAccountHandler)
	// router.GET("/accounts/:id/info", accountInfoHandler)
	// router.GET("/accounts/:id/transactions", getTransactionsHandler)
	// router.POST("/accounts/:id/transactions", postTransactionHandler)

	// Handling assets
	router.GET("/", assetHandler)
	router.GET("/assets/*asset", assetHandler)
	router.GET("/images/*image", assetHandler)
	return router
}

func transactionHandler(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	var request types.Transaction
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	// Ensure the request is not a zero value
	if request == (types.Transaction{}) {
		http.Error(w, "Request cannot be empty or zero value", http.StatusBadRequest)
		return
	}

	// TODO: fraud detection is a wasmpay "pro" feature that's optional
	proFeature := r.Header.Get("X-Wasmpay-Pro")
	logger := slog.New(wasilog.DefaultOptions().NewHandler())
	if proFeature != "" {
		logger.Info("Validated transaction as non-fraudlent, sending for processing")
		// TODO: AI detect fraud
	}

	transactionManagerResponse := validation.Validate(request)
	if transactionManagerResponse.Approved {
		successResponse(w, "Transaction is valid and has been processed successfully.")
	} else {
		http.Error(w, fmt.Sprintf("Transaction failed validation: %s", *transactionManagerResponse.Reason.Some()), http.StatusBadRequest)
		return
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
		http.Error(w, "Failed to decode request.", http.StatusBadRequest)
		return
	}
	audience := req.Audience

	result := store.Get(audience)
	resultOk := result.OK()
	if resultOk == nil {
		logger.Error("failed to load JWT from identity service", "error", result.Err())
		http.Error(w, "Failed to load JWT.", http.StatusBadRequest)
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
		http.Error(w, "Failed to decode request.", http.StatusBadRequest)
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
		http.Error(w, "Failed to load AWS config for STS", http.StatusBadRequest)
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
		http.Error(w, "Failed to assume role.", http.StatusBadRequest)
		return
	}

	brCfg, err := config.LoadDefaultConfig(ctx, config.WithHTTPClient(httpClient), config.WithRegion(region), config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(stsOut.Credentials.AccessKeyID, stsOut.Credentials.SecretAccessKey, stsOut.Credentials.SessionToken)))
	if err != nil {
		logger.Error("failed to load AWS config for Bedrock Runtime", "error", err)
		http.Error(w, "Failed to load AWS config for Bedrock Runtime", http.StatusBadRequest)
		return
	}

	if err != nil {
		logger.Error("failed to marshal bytes", "error", err)
		http.Error(w, "Failed to marshal bytes", http.StatusBadRequest)
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
		http.Error(w, "Failed to invoke model", http.StatusBadRequest)
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
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	prompt := fmt.Sprintf("Translate the following text from %s to %s: \"%s\"", request.SourceLang, request.TargetLang, request.Text)

	// TODO: AI EXECUTE
	logger := slog.New(wasilog.DefaultOptions().NewHandler())
	logger.Info("Translating text", prompt)
	response := "Hola, mundo!" // Placeholder for the actual translation response
	successResponse(w, response)
}

func healthzHandler(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	// TODO: try and healthz the transaction manager, aws conn, etc
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("OK"))
}

func assetHandler(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	assets, err := fs.Sub(staticAssets, "wasmcloud.banking/client/apps/banking/dist")
	if err != nil {
		http.Error(w, "Couldn't find static assets", http.StatusInternalServerError)
		return
	}
	fs := http.FileServer(http.FS(assets))
	http.StripPrefix("/", fs).ServeHTTP(w, r)
}

type SuccessResponse struct {
	Data interface{} `json:"data"`
}

func successResponse(w http.ResponseWriter, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(SuccessResponse{Data: data})
}
