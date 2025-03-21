package main

import (
	"embed"
	"encoding/json"
	"fmt"
	"io/fs"
	"log/slog"
	"net/http"

	// Generated interfaces
	"github.com/cosmonic-labs/wasmpay/api-gateway/gen/wasmpay/platform/types"
	"github.com/julienschmidt/httprouter"
	"go.wasmcloud.dev/component/log/wasilog"
)

//go:embed wasmcloud.banking/client/apps/banking/dist/*
var staticAssets embed.FS

// Router creates a [http.Handler] and registers the application-specific
// routes with their respective handlers for the application.
func Router() http.Handler {
	router := httprouter.New()

	// Helper to know when the server is up
	router.GET("/healthz", healthzHandler)
	// Send requests to the LLM for translation
	router.POST("/api/v1/chat", chatHandler)
	// Send requests to LLM for fraud detection, then kick off transaction
	router.POST("/api/v1/transaction", transactionHandler)
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
		// TODO: AI detect fraud
		logger.Info("Validated transaction as non-fraudlent, sending for processing")
	}

	// TODO: call the transaction manager
	// transactionManagerResponse := validation.Validate(request)
	transactionManagerResponse := true
	if transactionManagerResponse {
		successResponse(w, "Transaction is valid and has been processed successfully.")
	} else {
		http.Error(w, "Transaction failed validation.", http.StatusBadRequest)
		return
	}
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
