FROM python:3.14-slim

WORKDIR /app

COPY requirements.txt /app
RUN pip install --no-cache-dir -r requirements.txt

COPY libs/ ./libs/
COPY services/ ./services/

ENV PYTHONPATH=/app

CMD ["python", "-m", "services.api.main"] 
