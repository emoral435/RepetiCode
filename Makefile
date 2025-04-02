GOBIN = $(shell go env GOPATH)/bin

.PHONY: install-go-test-coverage
install-go-test-coverage:
	go install github.com/vladopajic/go-test-coverage/v2@v2.12.0

.PHONY: check-coverage
check-coverage: install-go-test-coverage
	go test ./... -coverprofile=./cover.out -covermode=atomic -coverpkg=./...
	${GOBIN}/go-test-coverage --config=./.testcoverage.yml

.PHONY: builddocker
builddocker:
	docker build -t repeticode .

.PHONY: rundocker
rundocker:
	docker run --env-file .env -p 8080:8080 repeticode

.PHONY: buildfrontend
buildfrontend:
	cd frontend ; npm run build

.PHONY: run
run: buildfrontend builddocker rundocker
	echo "Running on 127.0.0.1:8080"


.PHONY: gotest
gotest:
	go test ./... -v -coverprofile cover.out

.PHONY: golint
golint:
	golangci-lint run

.PHONY: gopackage
gopackage: gotest golint