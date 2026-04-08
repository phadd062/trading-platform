npm run build
aws s3 sync dist/ s3://trading-platform-frontend-b12437f9 --delete
aws cloudfront create-invalidation --distribution-id <dist-id> --paths "/*"
