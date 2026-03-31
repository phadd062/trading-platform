$subnets = (.\.terraform.exe output -json private_app_subnet_ids | ConvertFrom-Json) -join ','
$sg = .\.terraform.exe output -raw ecs_security_group_id
aws ecs run-task --cluster trading-platform --launch-type FARGATE --task-definition trading-platform-replay-market-data --network-configuration "awsvpcConfiguration={subnets=[$subnets],securityGroups=[$sg],assignPublicIp=DISABLED}"
