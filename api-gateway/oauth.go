//go:generate go tool wit-bindgen-go generate --world api-gateway --out gen ../wit
package main

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	// Generated interfaces

	"github.com/julienschmidt/httprouter"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/github"
)

// loginHandler initiates the OAuth flow by redirecting the user to the OAuth provider's login page.
func loginHandler(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	oauthConfig, err := oauthConfig()
	if err != nil {
		http.Error(w, "Failed to get OAuth config: "+err.Error(), http.StatusInternalServerError)
		return
	}
	url := oauthConfig.AuthCodeURL("state", oauth2.AccessTypeOffline)
	http.Redirect(w, r, url, http.StatusTemporaryRedirect)
}

// callbackHandler handles the GitHub callback and exchanges the authorization code for an access token.
func callbackHandler(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	oauthConfig, err := oauthConfig()
	if err != nil {
		http.Error(w, "Failed to get OAuth config: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Get the authorization code from the URL query parameters
	code := r.FormValue("code")

	// Use custom HTTP client for token exchange
	ctx := context.WithValue(context.Background(), oauth2.HTTPClient, httpClient)
	token, err := oauthConfig.Exchange(ctx, code)
	if err != nil {
		http.Error(w, "Failed to exchange token: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Use token to make authenticated requests with custom HTTP client
	client := oauthConfig.Client(ctx, token)
	userInfo, err := getUserInfo(client)
	if err != nil {
		http.Error(w, "Failed to get user info: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Create a new cookie
	cookie := &http.Cookie{
		Name:  "user",
		Value: base64.RawStdEncoding.EncodeToString(userInfo),
		Path:  "/",
	}

	// Set the cookie in the response
	http.SetCookie(w, cookie)

	// Add user info to request query
	http.Redirect(w, r, "/", http.StatusFound)
}

// getUserInfo fetches user information from GitHub's API using the authenticated client.
func getUserInfo(client *http.Client) ([]byte, error) {
	req, err := http.NewRequest("GET", "https://api.github.com/user", nil)
	if err != nil {
		return make([]byte, 0), fmt.Errorf("creating request: %w", err)
	}

	// Add required headers
	req.Header.Set("User-Agent", "Go-HTTP-Client/Multitier-Security-Example")
	req.Header.Set("Accept", "application/json")

	resp, err := client.Do(req)
	if err != nil {
		return make([]byte, 0), fmt.Errorf("executing request: %w", err)
	}
	defer resp.Body.Close()

	// Check status code
	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return make([]byte, 0), fmt.Errorf("API request failed with status %d: %s", resp.StatusCode, string(body))
	}

	var userInfo map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&userInfo); err != nil {
		return make([]byte, 0), fmt.Errorf("decoding response: %w", err)
	}

	userInfoJSON, err := json.Marshal(userInfo)
	if err != nil {
		return make([]byte, 0), fmt.Errorf("formatting JSON: %w", err)
	}
	return userInfoJSON, nil
}

// Fetch the OAuth2 config including the client ID and secret
// as secrets.
func oauthConfig() (oauth2.Config, error) {
	// clientId := secretstore.Get("client_id")
	// if err := clientId.Err(); err != nil {
	// 	return oauth2.Config{}, fmt.Errorf("getting client ID: %s", err.String())
	// }
	// clientSecret := secretstore.Get("client_secret")
	// if err := clientSecret.Err(); err != nil {
	// 	return oauth2.Config{}, fmt.Errorf("getting client secret: %s", err.String())
	// }

	// fmt.Fprintf(os.Stderr, "Client ID: %d\n", clientId.OK())
	// fmt.Fprintf(os.Stderr, "Client Secret: %d\n", clientSecret.OK())

	// clientIdReal := reveal.Reveal(*clientId.OK())
	// clientSecretReal := reveal.Reveal(*clientSecret.OK())
	return oauth2.Config{
		ClientID:     "Ov23lira5kiLoyNvLTYa",
		ClientSecret: "b2f31b1cd3dba1f52eab2b4e2b201a34f5402ae9",
		// ClientID:     *clientIdReal.String_(),
		// ClientSecret: *clientSecretReal.String_(),
		RedirectURL: "http://127.0.0.1:8000/oauth/callback",
		Scopes:      []string{},
		Endpoint:    github.Endpoint,
	}, nil
	// return oauth2.Config{}, nil
}
