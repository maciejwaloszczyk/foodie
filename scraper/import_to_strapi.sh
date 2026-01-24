#!/bin/bash

# Konfiguracja
STRAPI_URL="https://api-agh.waloszczyk.eu/api/restaurants"
API_TOKEN="bd5d2cbc9be76715b1ec2718e78659f03f47b724444eef850a12a1accfd19fc93d66e8d3e06eef45da3458c8c5fa83602a910dd94d4e359d5ee88d5f1852e00d384cc0f3e2b223fb03c6475b4f3ab4d8b520b99dad3d0369ff4b6714eda7242450608eafbf9f6a95d9558fae773affac94a788078af23a751c70c683c8169ef6"
JSON_FILE="../restaurants_2025-12-04_13-42.json"

# Liczniki
SUCCESS=0
FAILED=0
TOTAL=0

echo "🚀 Rozpoczynam import restauracji do Strapi..."
echo "📍 URL: $STRAPI_URL"
echo ""

# Parsowanie JSON i wysyłanie każdej restauracji
cat "$JSON_FILE" | jq -c '.[]' | while read -r restaurant; do
    TOTAL=$((TOTAL + 1))
    
    # Ekstrakcja danych
    NAME=$(echo "$restaurant" | jq -r '.name')
    ADDRESS=$(echo "$restaurant" | jq -r '.address')
    PHONE=$(echo "$restaurant" | jq -r '.phone // ""')
    LAT=$(echo "$restaurant" | jq -r '.lat')
    LNG=$(echo "$restaurant" | jq -r '.lng')
    WEBSITE=$(echo "$restaurant" | jq -r '.website // ""')
    PLACE_ID=$(echo "$restaurant" | jq -r '.place_id')
    
    # Wyciągnięcie miasta i kodu pocztowego z adresu
    # Format: "ulica, kod pocztowy miasto, Poland"
    CITY=$(echo "$ADDRESS" | sed -E 's/.*[0-9]{2}-[0-9]{3} ([^,]+),.*/\1/')
    POSTAL_CODE=$(echo "$ADDRESS" | grep -oE '[0-9]{2}-[0-9]{3}' | head -1)
    
    echo "📤 [$TOTAL] Wysyłam: $NAME"
    
    # Przygotowanie JSON payload dla Strapi
    PAYLOAD=$(jq -n \
        --arg name "$NAME" \
        --arg address "$ADDRESS" \
        --arg city "$CITY" \
        --arg postal "$POSTAL_CODE" \
        --arg lat "$LAT" \
        --arg lng "$LNG" \
        --arg phone "$PHONE" \
        --arg website "$WEBSITE" \
        --arg place_id "$PLACE_ID" \
        '{
            data: {
                name: $name,
                address: $address,
                city: $city,
                postalCode: $postal,
                latitude: ($lat | tonumber),
                longitude: ($lng | tonumber),
                avg_rating: 0
            }
        }')
    
    # Wysłanie do Strapi
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$STRAPI_URL" \
        -H "Authorization: Bearer $API_TOKEN" \
        -H "Content-Type: application/json" \
        -d "$PAYLOAD")
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    if [ "$HTTP_CODE" -eq 200 ] || [ "$HTTP_CODE" -eq 201 ]; then
        SUCCESS=$((SUCCESS + 1))
        echo "   ✅ Sukces (HTTP $HTTP_CODE)"
    else
        FAILED=$((FAILED + 1))
        echo "   ❌ Błąd (HTTP $HTTP_CODE)"
        echo "   Response: $BODY" | head -c 200
        echo ""
    fi
    
    # Małe opóźnienie, żeby nie przeciążyć API
    sleep 0.2
done

echo ""
echo "📊 Podsumowanie:"
echo "   ✅ Sukces: $SUCCESS"
echo "   ❌ Błędy: $FAILED"
echo "   📝 Razem: $TOTAL"
