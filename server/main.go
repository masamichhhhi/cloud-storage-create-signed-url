package main

import (
	"context"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"time"

	"cloud.google.com/go/storage"
	"github.com/google/uuid"
	"github.com/joho/godotenv"
	"golang.org/x/oauth2/google"
	"google.golang.org/api/iam/v1"
)

var (
	iamService         *iam.Service
	serviceAccountName string
	serviceAccountID   string
	uploadableBucket   string
)

func signHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		w.Header().Set("Allow", "Post")
		http.Error(w, "Only POST is supported", http.StatusMethodNotAllowed)
		return
	}

	ct := r.FormValue("content_type")
	if ct == "" {
		http.Error(w, "content_type must be set", http.StatusBadRequest)
		return
	}

	key := uuid.New().String()
	if ext := r.FormValue("ext"); ext != "" {
		key += fmt.Sprintf(".%s", ext)
	}

	url, err := generateV4PutObjectSignedURL(w, uploadableBucket, key, serviceAccountName)

	if err != nil {
		log.Printf("sign: failed to sign, err = %v\n", err)
		http.Error(w, "failed to sign by internal serval error", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	fmt.Fprintln(w, url)
}

func generateV4PutObjectSignedURL(w io.Writer, bucket, object, serviceAccount string) (string, error) {
	// bucket := "bucket-name"
	// object := "object-name"
	// serviceAccount := "service_account.json"
	jsonKey, err := ioutil.ReadFile(serviceAccount)
	if err != nil {
		return "", fmt.Errorf("ioutil.Readfile: %v", err)
	}
	conf, err := google.JWTConfigFromJSON(jsonKey)
	if err != nil {
		return "", fmt.Errorf("google.JWTConfigFromJson: %v", err)
	}
	opts := &storage.SignedURLOptions{
		Scheme: storage.SigningSchemeV4,
		Method: "PUT",
		Headers: []string{
			"Content-Type:application/octet-stream",
		},
		GoogleAccessID: conf.Email,
		PrivateKey:     conf.PrivateKey,
		Expires:        time.Now().Add(15 * time.Minute),
	}
	u, err := storage.SignedURL(bucket, object, opts)
	if err != nil {
		return "", fmt.Errorf("storage.SignedURL: %v", err)
	}

	fmt.Fprintln(w, "Generated PUT signed URL: ")
	return u, nil
}

func loadEnv() {
	err := godotenv.Load(".env")
	if err != nil {
		fmt.Printf("cannot load env file: %v", err)
	}
}

func main() {
	loadEnv()

	cred, err := google.DefaultClient(context.Background(), iam.CloudPlatformScope)
	if err != nil {
		log.Fatal(err)
	}
	iamService, err = iam.New(cred)
	if err != nil {
		log.Fatal(err)
	}

	uploadableBucket = os.Getenv("UPLOADABLE_BUCKET")
	serviceAccountName = os.Getenv("SERVICE_ACCOUNT")
	serviceAccountID = fmt.Sprintf(
		"projects/%s/serviceAccount/%s",
		os.Getenv("GOOGLE_CLOUD_PROJECT"),
		serviceAccountName,
	)

	http.HandleFunc("/sign", signHandler)
	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%s", os.Getenv("PORT")), nil))
}
