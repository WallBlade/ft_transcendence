# Use an official Python runtime as a parent image
FROM python:3.8-slim
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Set the working directory in the container
WORKDIR /app

#Install openSSL and postgresql-client
RUN apt-get update && apt-get install -y postgresql-client &&\
    apt-get install -y --no-install-recommends build-essential libpq-dev && \
    apt-get install -y openssl && \
    apt-get install -y --no-install-recommends build-essential libpq-dev && \
        apt-get clean && \
        rm -rf /var/lib/apt/lists/*

#Generate SSL certificate
RUN mkdir -p /etc/ssl/certs && \
    openssl req -x509 -newkey rsa:4096 -nodes -keyout /etc/ssl/certs/key.pem -out /etc/ssl/certs/cert.pem -days 365 -subj "/C=FR/ST=IDF/L=Paris/O=42/OU=42/CN=smessal.42.fr/UID=smessal"

COPY wait-db.sh /wait-db.sh

RUN chmod +x /wait-db.sh

# Copy the current directory contents into the container at /app
COPY . /app

# Install any needed packages specified in requirements.txt
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# Make port 8000 available to the world outside this container
EXPOSE 8000

WORKDIR /app/back

ENTRYPOINT ["/wait-db.sh"]

CMD ["uvicorn", "back.asgi:application", "--host", "0.0.0.0", "--port", "8000", "--ssl-certfile=/etc/ssl/certs/cert.pem", "--ssl-keyfile=/etc/ssl/certs/key.pem", "--reload"]
