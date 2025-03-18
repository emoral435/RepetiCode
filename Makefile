.PHONY: rundocker builddocker

builddocker:
	docker build --no-cache -t repeticode .

rundocker:
	docker run -p 8080:8080 repeticode
