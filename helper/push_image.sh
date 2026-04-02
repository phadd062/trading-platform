docker build -t trading-platform .

aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 467091806900.dkr.ecr.us-east-1.amazonaws.com
docker tag trading-platform:latest 467091806900.dkr.ecr.us-east-1.amazonaws.com/trading-platform:latest
docker push 467091806900.dkr.ecr.us-east-1.amazonaws.com/trading-platform:latest

aws ecs update-service --cluster trading-platform --service trading-platform-market-data --force-new-deployment --region us-east-1
aws ecs update-service --cluster trading-platform --service trading-platform-strategy --force-new-deployment --region us-east-1
aws ecs update-service --cluster trading-platform --service trading-platform-risk --force-new-deployment --region us-east-1
aws ecs update-service --cluster trading-platform --service trading-platform-execution --force-new-deployment --region us-east-1
aws ecs update-service --cluster trading-platform --service trading-platform-portfolio --force-new-deployment --region us-east-1
aws ecs update-service --cluster trading-platform --service trading-platform-event-store --force-new-deployment --region us-east-1
aws ecs update-service --cluster trading-platform --service trading-platform-api --force-new-deployment --region us-east-1
