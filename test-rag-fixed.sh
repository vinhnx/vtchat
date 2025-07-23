#!/bin/bash

echo "Starting development server in background..."
cd /Users/vinh.nguyenxuan/Developer/learn-by-doing/vtchat
bun dev &
SERVER_PID=$!

echo "Waiting for server to start..."
sleep 15

echo "Testing RAG functionality with fixed embedding model..."
curl -X POST http://localhost:3000/api/agent/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VT-PLUS" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "who is the user?"
      }
    ]
  }' 2>/dev/null

echo -e "\n\nStopping development server..."
kill $SERVER_PID
echo "Test complete!"
