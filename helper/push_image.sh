aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 467091806900.dkr.ecr.us-east-1.amazonaws.com
docker build -t trading-platform-app .
docker tag trading-platform-app:latest 467091806900.dkr.ecr.us-east-1.amazonaws.com/trading-platform:latest
docker push 467091806900.dkr.ecr.us-east-1.amazonaws.com/trading-platform:latest
