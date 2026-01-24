#!/bin/bash

# Wczytaj zmienne z .env.local
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ENV_FILE="$SCRIPT_DIR/../.env.local"

export $(grep -v '^#' "$ENV_FILE" | xargs)

READ_TOKEN="$NEXT_PUBLIC_STRAPI_KEY"
WRITE_TOKEN="$STRAPI_KEY"
API="$NEXT_PUBLIC_STRAPI_URL/api"

echo "API: $API"
echo "READ_TOKEN length: ${#READ_TOKEN}"
echo "WRITE_TOKEN length: ${#WRITE_TOKEN}"

# Dania
DISHES=(
  "Pizza Margherita:28"
  "Spaghetti Carbonara:26"
  "Burger Classic:25"
  "Salata Cezar:22"
  "Zupa pomidorowa:14"
  "Kurczak grillowany:28"
  "Ryba smazona:32"
  "Steak wolowy:45"
  "Pierogi z miesem:22"
  "Risotto:28"
  "Kebab:25"
  "Ramen:32"
  "Tacos:24"
  "Tiramisu:18"
  "Brownie:16"
)

# Komentarze
COMMENTS=(
  "Bardzo smaczne polecam!"
  "Swieże i dobrze przyprawione"
  "Porcja duza smak wysmienity"
  "Rewelacja! Na pewno wroce"
  "Swietna jakosc za te cene"
  "Najlepsze w okolicy!"
  "Polecam wszystkim!"
  "Warto sprobowac"
)

# Atrybuty
ATTRS=("wbug1fvk58inxrgb5oey8g0s" "a7ddth3xmtglnwophc1rgx3u" "m5y5gnru57xtzhudav9r9zu5")

create_dish() {
  local rest_id=$1
  local name=$2
  local price=$3
  result=$(curl -s -X POST "$API/dishes" -H "Authorization: Bearer $WRITE_TOKEN" -H "Content-Type: application/json" -d "{\"data\":{\"name\":\"$name\",\"price\":$price,\"restaurant\":\"$rest_id\"}}")
  echo "$result" | jq -r '.data.documentId // empty'
}

create_review() {
  local dish_id=$1
  local rating=$2
  local comment=$3
  result=$(curl -s -X POST "$API/reviews" -H "Authorization: Bearer $WRITE_TOKEN" -H "Content-Type: application/json" -d "{\"data\":{\"rating\":$rating,\"comment\":\"$comment\",\"dish\":\"$dish_id\"}}")
  echo "$result" | jq -r '.data.documentId // empty'
}

# Pobierz restauracje
echo "Pobieram restauracje..."
RESTAURANTS=$(curl -s "$API/restaurants?pagination[limit]=100" -H "Authorization: Bearer $READ_TOKEN" | jq -r '.data[].documentId')

count=0
for rest_id in $RESTAURANTS; do
  count=$((count + 1))
  echo "=== Restauracja $count: $rest_id ==="
  
  # 3 losowe dania
  dish_ids=()
  for i in 1 2 3; do
    idx=$((RANDOM % ${#DISHES[@]}))
    dish_info="${DISHES[$idx]}"
    name="${dish_info%%:*}"
    price="${dish_info##*:}"
    
    dish_id=$(create_dish "$rest_id" "$name" "$price")
    if [ -n "$dish_id" ]; then
      dish_ids+=("$dish_id")
      echo "  + Danie: $name ($dish_id)"
    fi
    sleep 0.5
  done
  
  # 2-4 opinie
  num_reviews=$((2 + RANDOM % 3))
  for j in $(seq 1 $num_reviews); do
    if [ ${#dish_ids[@]} -gt 0 ]; then
      idx=$((RANDOM % ${#dish_ids[@]}))
      dish_id="${dish_ids[$idx]}"
      
      rating_int=$((30 + RANDOM % 21))
      rating=$(echo "scale=1; $rating_int / 10" | bc)
      
      comm_idx=$((RANDOM % ${#COMMENTS[@]}))
      comment="${COMMENTS[$comm_idx]}"
      
      review_id=$(create_review "$dish_id" "$rating" "$comment")
      if [ -n "$review_id" ]; then
        echo "  + Opinia: $rating ($review_id)"
      fi
      sleep 0.5
    fi
  done
  
  echo ""
done

echo "Gotowe!"
