# Troubleshooting Guide

Common issues and solutions for the Document Processing Module.

## Database Issues

### MongoDB Connection Failed

**Error:** `MongoDB connection error: connect ECONNREFUSED`

**Solutions:**
1. Verify MongoDB is running:
   ```bash
   docker ps | grep mongodb
   ```

2. Check MongoDB logs:
   ```bash
   docker logs n8n-mongodb
   ```

3. Test connection directly:
   ```bash
   mongosh mongodb://admin:password@localhost:27017/admin
   ```

4. Verify credentials in .env:
   ```bash
   grep DB_MONGODB .env
   ```

5. Check MongoDB port:
   ```bash
   netstat -an | grep 27017
   ```

### MongoDB Authentication Failed

**Error:** `Authentication failed`

**Solutions:**
1. Verify username/password in .env
2. Reset MongoDB password:
   ```bash
   docker exec n8n-mongodb mongosh admin --eval "db.changeUserPassword('admin', 'newpassword')"
   ```
3. Restart MongoDB:
   ```bash
   docker-compose restart mongodb
   ```

### MongoDB Disk Full

**Error:** `error: no space left on device`

**Solutions:**
1. Check disk space:
   ```bash
   df -h
   ```

2. Clean old data:
   ```bash
   # Delete documents older than 90 days
   db.processed_documents.deleteMany({
     timestamp: { $lt: new Date(Date.now() - 90*24*60*60*1000) }
   })
   ```

3. Prune indexes:
   ```bash
   db.processed_documents.reIndex()
   ```

## Workflow Issues

### Workflows Not Triggering

**Symptoms:** API endpoints don't respond, scheduled workflows don't run

**Solutions:**
1. Verify workflow is activated:
   - Go to n8n UI
   - Check if toggle is ON for each workflow

2. Check webhook URL:
   ```bash
   curl -X GET http://localhost:5678/health
   ```

3. Test webhook:
   ```bash
   curl -X POST http://localhost:5678/webhook/document-processor-api \
     -H "Content-Type: application/json" \
     -d '{"documentType": "invoice", "content": "test"}'
   ```

4. Review n8n logs:
   ```bash
   docker logs n8n-app | grep -i webhook
   ```

### Workflow Timeout

**Error:** `Workflow execution timeout`

**Solutions:**
1. Increase execution timeout in n8n:
   ```env
   N8N_EXECUTION_TIMEOUT=3600000
   ```

2. Optimize document processing:
   - Reduce batch size
   - Optimize MongoDB queries
   - Check node performance

3. Monitor resource usage:
   ```bash
   docker stats n8n-app
   ```

### Credentials Not Found

**Error:** `The credential "MongoDB Account" was not found`

**Solutions:**
1. Create credentials in n8n UI:
   - Go to Credentials
   - Click "Add Credential"
   - Enter MongoDB details

2. Verify credential name matches workflow:
   - Check workflow JSON for credential names
   - Update if necessary

3. Export and reimport workflow:
   ```bash
   npm run export-workflows
   npm run import-workflows
   ```

## API Issues

### API Endpoint Returns 404

**Error:** `404 Not Found`

**Solutions:**
1. Verify endpoint path:
   ```bash
   curl -v http://localhost:5678/webhook/document-processor-api
   ```

2. Check workflow webhook configuration
3. Restart n8n:
   ```bash
   docker-compose restart n8n
   ```

### Invalid Request Body

**Error:** `400 Bad Request - validation failed`

**Solutions:**
1. Check request format:
   ```bash
   # Must include required fields
   curl -X POST http://localhost:5678/webhook/document-processor-api \
     -H "Content-Type: application/json" \
     -d '{"documentType": "invoice", "content": "..."}'
   ```

2. Validate JSON:
   ```bash
   echo '{"test": "data"}' | jq .
   ```

3. Review error message for specific missing fields

### Rate Limiting

**Error:** `429 Too Many Requests`

**Solutions:**
1. Reduce request frequency
2. Implement exponential backoff
3. Increase rate limit:
   ```env
   API_RATE_LIMIT=1000000  # per hour
   ```

## Performance Issues

### Slow Document Processing

**Symptoms:** Documents take >10 seconds to process

**Solutions:**
1. Check MongoDB indexes:
   ```bash
   docker exec n8n-mongodb mongosh document_processing --eval "db.processed_documents.getIndexes()"
   ```

2. Monitor CPU/Memory:
   ```bash
   docker stats n8n-app
   ```

3. Optimize n8n memory:
   ```yaml
   # In docker-compose.yml
   environment:
     - NODE_OPTIONS=--max-old-space-size=4096
   ```

4. Check node performance:
   - Review Code nodes for inefficiencies
   - Optimize MongoDB queries
   - Enable query caching

### High Memory Usage

**Error:** `Out of memory` or slow performance

**Solutions:**
1. Increase container memory:
   ```yaml
   # docker-compose.yml
   services:
     n8n:
       deploy:
         resources:
           limits:
             memory: 4G
   ```

2. Configure n8n memory limits:
   ```env
   NODE_OPTIONS=--max-old-space-size=4096
   EXECUTIONS_DATA_MAX_AGE=7d
   ```

3. Enable garbage collection:
   ```bash
   # Prune old executions
   db.execution.deleteMany({ stopedAt: { $lt: new Date(Date.now() - 7*24*60*60*1000) } })
   ```

### Slow API Responses

**Symptoms:** API calls take >5 seconds

**Solutions:**
1. Check MongoDB query performance:
   ```bash
   # Enable slow query log
   db.setProfilingLevel(1, { slowms: 100 })
   
   # Review slow queries
   db.system.profile.find().limit(5).sort({ ts: -1 }).pretty()
   ```

2. Add database indexes:
   ```bash
   db.processed_documents.createIndex({ "timestamp": -1, "documentType": 1 })
   ```

3. Monitor n8n performance:
   ```bash
   docker stats n8n-app
   ```

## Slack Integration Issues

### Slack Messages Not Sending

**Error:** `Slack notification failed`

**Solutions:**
1. Verify Slack token:
   ```bash
   grep SLACK_BOT_TOKEN .env
   ```

2. Test Slack connection:
   ```bash
   curl -H "Authorization: Bearer $SLACK_BOT_TOKEN" \
     https://slack.com/api/auth.test
   ```

3. Check channel access:
   - Verify bot is in channel
   - Check channel ID in workflow

4. Review n8n logs:
   ```bash
   docker logs n8n-app | grep -i slack
   ```

## Email Integration Issues

### Emails Not Sending

**Error:** `SMTP connection failed` or `Mail not sent`

**Solutions:**
1. Verify SMTP credentials:
   ```bash
   grep SMTP .env
   ```

2. Test SMTP connection:
   ```bash
   telnet smtp.gmail.com 587
   ```

3. Check firewall:
   ```bash
   # Allow port 587
   sudo ufw allow 587
   ```

4. Enable "Less secure apps" (for Gmail):
   - Go to Google Account settings
   - Enable "Less secure app access"

5. For Gmail, use app password:
   - Create app password in Google Account
   - Update SMTP_PASSWORD in .env

## Docker Issues

### Container Won't Start

**Error:** `Container exited with code 1`

**Solutions:**
1. Check container logs:
   ```bash
   docker-compose logs n8n
   ```

2. Verify environment variables:
   ```bash
   docker-compose config
   ```

3. Rebuild image:
   ```bash
   docker-compose build --no-cache
   docker-compose up -d
   ```

### Port Already in Use

**Error:** `Bind for 0.0.0.0:5678 failed: port is already allocated`

**Solutions:**
1. Find process using port:
   ```bash
   lsof -i :5678
   ```

2. Kill process:
   ```bash
   kill -9 <PID>
   ```

3. Or use different port:
   ```env
   N8N_PORT=5679
   ```

## Logging & Monitoring

### Enable Debug Logging

```env
LOG_LEVEL=debug
N8N_LOG_LEVEL=debug
```

### View Real-time Logs

```bash
docker-compose logs -f n8n
```

### Check System Resources

```bash
# Overall system
free -h
df -h

# Docker containers
docker stats

# Specific container
docker stats n8n-app
```

## Testing

### Run Validation

```bash
npm run validate-config
```

### Test Database Connection

```bash
mongosh mongodb://admin:password@localhost:27017/document_processing
```

### Test API Endpoints

```bash
# Test document processor
curl -X POST http://localhost:5678/webhook/document-processor-api \
  -H "Content-Type: application/json" \
  -d '{"documentType": "invoice", "content": "test content"}'

# Test health
curl http://localhost:5678/health
```

## Backup & Recovery

### Check Latest Backup

```bash
ls -lah /backups/
```

### Create Backup

```bash
docker exec n8n-mongodb mongodump --uri="mongodb://..." --out=/backups/latest
```

### Restore from Backup

```bash
docker exec n8n-mongodb mongorestore --uri="mongodb://..." /backups/latest
```

## Support

If issues persist:

1. Check logs thoroughly:
   ```bash
   docker-compose logs --tail=100
   ```

2. Validate configuration:
   ```bash
   npm run validate-config
   ```

3. Test connectivity:
   ```bash
   ping mongodb
   curl http://localhost:5678/health
   ```

4. Review documentation:
   - README.md
   - DEPLOYMENT.md
   - API_EXAMPLES.md

5. Contact support with:
   - Error messages
   - Configuration (sanitized)
   - Recent logs
   - Steps to reproduce# Troubleshooting Guide

Common issues and solutions for the Document Processing Module.

## Database Issues

### MongoDB Connection Failed

**Error:** `MongoDB connection error: connect ECONNREFUSED`

**Solutions:**
1. Verify MongoDB is running:
   ```bash
   docker ps | grep mongodb
   ```

2. Check MongoDB logs:
   ```bash
   docker logs n8n-mongodb
   ```

3. Test connection directly:
   ```bash
   mongosh mongodb://admin:password@localhost:27017/admin
   ```

4. Verify credentials in .env:
   ```bash
   grep DB_MONGODB .env
   ```

5. Check MongoDB port:
   ```bash
   netstat -an | grep 27017
   ```

### MongoDB Authentication Failed

**Error:** `Authentication failed`

**Solutions:**
1. Verify username/password in .env
2. Reset MongoDB password:
   ```bash
   docker exec n8n-mongodb mongosh admin --eval "db.changeUserPassword('admin', 'newpassword')"
   ```
3. Restart MongoDB:
   ```bash
   docker-compose restart mongodb
   ```

### MongoDB Disk Full

**Error:** `error: no space left on device`

**Solutions:**
1. Check disk space:
   ```bash
   df -h
   ```

2. Clean old data:
   ```bash
   # Delete documents older than 90 days
   db.processed_documents.deleteMany({
     timestamp: { $lt: new Date(Date.now() - 90*24*60*60*1000) }
   })
   ```

3. Prune indexes:
   ```bash
   db.processed_documents.reIndex()
   ```

## Workflow Issues

### Workflows Not Triggering

**Symptoms:** API endpoints don't respond, scheduled workflows don't run

**Solutions:**
1. Verify workflow is activated:
   - Go to n8n UI
   - Check if toggle is ON for each workflow

2. Check webhook URL:
   ```bash
   curl -X GET http://localhost:5678/health
   ```

3. Test webhook:
   ```bash
   curl -X POST http://localhost:5678/webhook/document-processor-api \
     -H "Content-Type: application/json" \
     -d '{"documentType": "invoice", "content": "test"}'
   ```

4. Review n8n logs:
   ```bash
   docker logs n8n-app | grep -i webhook
   ```

### Workflow Timeout

**Error:** `Workflow execution timeout`

**Solutions:**
1. Increase execution timeout in n8n:
   ```env
   N8N_EXECUTION_TIMEOUT=3600000
   ```

2. Optimize document processing:
   - Reduce batch size
   - Optimize MongoDB queries
   - Check node performance

3. Monitor resource usage:
   ```bash
   docker stats n8n-app
   ```

### Credentials Not Found

**Error:** `The credential "MongoDB Account" was not found`

**Solutions:**
1. Create credentials in n8n UI:
   - Go to Credentials
   - Click "Add Credential"
   - Enter MongoDB details

2. Verify credential name matches workflow:
   - Check workflow JSON for credential names
   - Update if necessary

3. Export and reimport workflow:
   ```bash
   npm run export-workflows
   npm run import-workflows
   ```

## API Issues

### API Endpoint Returns 404

**Error:** `404 Not Found`

**Solutions:**
1. Verify endpoint path:
   ```bash
   curl -v http://localhost:5678/webhook/document-processor-api
   ```

2. Check workflow webhook configuration
3. Restart n8n:
   ```bash
   docker-compose restart n8n
   ```

### Invalid Request Body

**Error:** `400 Bad Request - validation failed`

**Solutions:**
1. Check request format:
   ```bash
   # Must include required fields
   curl -X POST http://localhost:5678/webhook/document-processor-api \
     -H "Content-Type: application/json" \
     -d '{"documentType": "invoice", "content": "..."}'
   ```

2. Validate JSON:
   ```bash
   echo '{"test": "data"}' | jq .
   ```

3. Review error message for specific missing fields

### Rate Limiting

**Error:** `429 Too Many Requests`

**Solutions:**
1. Reduce request frequency
2. Implement exponential backoff
3. Increase rate limit:
   ```env
   API_RATE_LIMIT=1000000  # per hour
   ```

## Performance Issues

### Slow Document Processing

**Symptoms:** Documents take >10 seconds to process

**Solutions:**
1. Check MongoDB indexes:
   ```bash
   docker exec n8n-mongodb mongosh document_processing --eval "db.processed_documents.getIndexes()"
   ```

2. Monitor CPU/Memory:
   ```bash
   docker stats n8n-app
   ```

3. Optimize n8n memory:
   ```yaml
   # In docker-compose.yml
   environment:
     - NODE_OPTIONS=--max-old-space-size=4096
   ```

4. Check node performance:
   - Review Code nodes for inefficiencies
   - Optimize MongoDB queries
   - Enable query caching

### High Memory Usage

**Error:** `Out of memory` or slow performance

**Solutions:**
1. Increase container memory:
   ```yaml
   # docker-compose.yml
   services:
     n8n:
       deploy:
         resources:
           limits:
             memory: 4G
   ```

2. Configure n8n memory limits:
   ```env
   NODE_OPTIONS=--max-old-space-size=4096
   EXECUTIONS_DATA_MAX_AGE=7d
   ```

3. Enable garbage collection:
   ```bash
   # Prune old executions
   db.execution.deleteMany({ stopedAt: { $lt: new Date(Date.now() - 7*24*60*60*1000) } })
   ```

### Slow API Responses

**Symptoms:** API calls take >5 seconds

**Solutions:**
1. Check MongoDB query performance:
   ```bash
   # Enable slow query log
   db.setProfilingLevel(1, { slowms: 100 })
   
   # Review slow queries
   db.system.profile.find().limit(5).sort({ ts: -1 }).pretty()
   ```

2. Add database indexes:
   ```bash
   db.processed_documents.createIndex({ "timestamp": -1, "documentType": 1 })
   ```

3. Monitor n8n performance:
   ```bash
   docker stats n8n-app
   ```

## Slack Integration Issues

### Slack Messages Not Sending

**Error:** `Slack notification failed`

**Solutions:**
1. Verify Slack token:
   ```bash
   grep SLACK_BOT_TOKEN .env
   ```

2. Test Slack connection:
   ```bash
   curl -H "Authorization: Bearer $SLACK_BOT_TOKEN" \
     https://slack.com/api/auth.test
   ```

3. Check channel access:
   - Verify bot is in channel
   - Check channel ID in workflow

4. Review n8n logs:
   ```bash
   docker logs n8n-app | grep -i slack
   ```

## Email Integration Issues

### Emails Not Sending

**Error:** `SMTP connection failed` or `Mail not sent`

**Solutions:**
1. Verify SMTP credentials:
   ```bash
   grep SMTP .env
   ```

2. Test SMTP connection:
   ```bash
   telnet smtp.gmail.com 587
   ```

3. Check firewall:
   ```bash
   # Allow port 587
   sudo ufw allow 587
   ```

4. Enable "Less secure apps" (for Gmail):
   - Go to Google Account settings
   - Enable "Less secure app access"

5. For Gmail, use app password:
   - Create app password in Google Account
   - Update SMTP_PASSWORD in .env

## Docker Issues

### Container Won't Start

**Error:** `Container exited with code 1`

**Solutions:**
1. Check container logs:
   ```bash
   docker-compose logs n8n
   ```

2. Verify environment variables:
   ```bash
   docker-compose config
   ```

3. Rebuild image:
   ```bash
   docker-compose build --no-cache
   docker-compose up -d
   ```

### Port Already in Use

**Error:** `Bind for 0.0.0.0:5678 failed: port is already allocated`

**Solutions:**
1. Find process using port:
   ```bash
   lsof -i :5678
   ```

2. Kill process:
   ```bash
   kill -9 <PID>
   ```

3. Or use different port:
   ```env
   N8N_PORT=5679
   ```

## Logging & Monitoring

### Enable Debug Logging

```env
LOG_LEVEL=debug
N8N_LOG_LEVEL=debug
```

### View Real-time Logs

```bash
docker-compose logs -f n8n
```

### Check System Resources

```bash
# Overall system
free -h
df -h

# Docker containers
docker stats

# Specific container
docker stats n8n-app
```

## Testing

### Run Validation

```bash
npm run validate-config
```

### Test Database Connection

```bash
mongosh mongodb://admin:password@localhost:27017/document_processing
```

### Test API Endpoints

```bash
# Test document processor
curl -X POST http://localhost:5678/webhook/document-processor-api \
  -H "Content-Type: application/json" \
  -d '{"documentType": "invoice", "content": "test content"}'

# Test health
curl http://localhost:5678/health
```

## Backup & Recovery

### Check Latest Backup

```bash
ls -lah /backups/
```

### Create Backup

```bash
docker exec n8n-mongodb mongodump --uri="mongodb://..." --out=/backups/latest
```

### Restore from Backup

```bash
docker exec n8n-mongodb mongorestore --uri="mongodb://..." /backups/latest
```

## Support

If issues persist:

1. Check logs thoroughly:
   ```bash
   docker-compose logs --tail=100
   ```

2. Validate configuration:
   ```bash
   npm run validate-config
   ```

3. Test connectivity:
   ```bash
   ping mongodb
   curl http://localhost:5678/health
   ```

4. Review documentation:
   - README.md
   - DEPLOYMENT.md
   - API_EXAMPLES.md

5. Contact support with:
   - Error messages
   - Configuration (sanitized)
   - Recent logs
   - Steps to reproduce