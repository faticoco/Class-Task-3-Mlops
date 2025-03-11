FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000

# Run with watch mode for development using Flask's debug mode
CMD ["python", "-m", "flask", "run", "--host=0.0.0.0", "--reload"]