.PHONY: rundocker builddocker run gotest

builddocker:
	docker build --no-cache -t repeticode .

rundocker:
	docker run --env-file .env -p 8080:8080 repeticode

run:
	cd frontend ; npm run build
	echo "Running on 127.0.0.1:8080"
	go run .

gotest:
	go test ./... -v -coverprofile cover.out
