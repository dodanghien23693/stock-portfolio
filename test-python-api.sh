#!/bin/bash

echo "🐍 Python Service API Test"
echo "========================"

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found! Please install Node.js first."
    exit 1
fi

# Check if curl is available
if ! command -v curl &> /dev/null; then
    echo "❌ curl not found! Please install curl first."
    exit 1
fi

# Set default values
STOCK_SYMBOL=${1:-VCB}
PERIOD=${2:-1Y}

echo "📊 Testing with Symbol: $STOCK_SYMBOL"
echo "⏱️  Testing with Period: $PERIOD"
echo ""

# Run the Node.js test script
node test-python-api.js "$STOCK_SYMBOL" "$PERIOD" "$3"

echo ""
echo "💡 Usage: ./test-python-api.sh [SYMBOL] [PERIOD] [--include-post]"
echo "   Example: ./test-python-api.sh VNM 6M --include-post"
echo ""
echo "🌐 Web UI: http://localhost:3000/python-service/test"
