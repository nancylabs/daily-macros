function cleanFoodName(name: string): string {
  // Lowercase
  let cleaned = name.toLowerCase();
  // Remove punctuation
  cleaned = cleaned.replace(/[.,/#!$%^&*;:{}=\-_`~()'"?]/g, '');
  // Remove common filler words
  cleaned = cleaned.replace(/\b(with|and|from|the|a|of|in|on|for|by|to|at|an|or|plus|served|topped|over|on top of|style|brand|trader joes|trader joe|costco|kirkland|whole foods|organic|fresh|classic|original|natural|unsweetened|sweetened|plain|greek|low fat|nonfat|fat free|reduced fat|light|large|small|medium|mini|extra|extra large|jumbo|premium|deluxe|chunky|creamy|crunchy|spicy|mild|hot|cold|iced|grilled|roasted|baked|fried|steamed|boiled|poached|smoked|cooked|raw|dried|canned|packaged|instant|quick|ready|ready to eat|microwavable|frozen|pre-cooked|pre cooked|precut|pre-cut|prewashed|pre-washed|bagged|bottled|carton|container|box|pouch|cup|bowl|plate|dish|meal|snack|breakfast|lunch|dinner|entree|side|main|appetizer|dessert|beverage|drink|juice|smoothie|shake|soda|pop|cola|water|tea|coffee|latte|mocha|espresso|cappuccino|frappuccino|macchiato|americano|brew|blend|roast|bean|leaf|herbal|decaf|decaffeinated|caffeinated|energy|sports|protein|whey|casein|soy|almond|oat|rice|coconut|cashew|hemp|pea|plant|dairy|milk|cream|cheese|yogurt|butter|spread|dip|sauce|dressing|vinaigrette|marinade|seasoning|spice|herb|extract|flavor|flavored|unflavored|original|classic|plain|vanilla|chocolate|strawberry|banana|berry|fruit|citrus|lemon|lime|orange|grapefruit|apple|pear|peach|plum|apricot|cherry|grape|melon|watermelon|cantaloupe|honeydew|pineapple|mango|papaya|kiwi|passion|guava|pomegranate|fig|date|raisin|currant|cranberry|blueberry|blackberry|raspberry|boysenberry|gooseberry|elderberry|mulberry|loganberry|cloudberry|lingonberry|acai|goji|sea buckthorn|tart|sweet|sour|bitter|savory|umami|rich|creamy|smooth|silky|velvety|thick|thin|light|airy|fluffy|dense|moist|dry|tender|juicy|succulent|crispy|crunchy|chewy|sticky|gooey|fudgy|buttery|nutty|earthy|herby|spicy|zesty|peppery|garlicky|oniony|lemony|limey|orangey|appley|peachy|plummy|cherry|grapey|melony|pineapply|mangoey|papayaey|kiwiy|passiony|guavay|pomegranatey|figgy|datey|raisiny|curranty|cranberryy|blueberryy|blackberryy|raspberryy|boysenberryy|gooseberryy|elderberryy|mulberryy|loganberryy|cloudberryy|lingonberryy|acaiy|gojiy|sea buckthorny|tarty|sweetish|sourish|bitterish|savoryish|umamiish|richish|creamyish|smoothish|silkyish|velvetyish|thickish|thin|lightish|airyish|fluffyish|denseish|moistish|dryish|tenderish|juicyish|succulentish|crispyish|crunchyish|chewyish|stickyish|gooeyish|fudgyish|butteryish|nuttyish|earthyish|herbyish|spicyish|zestyish|pepperyish|garlickyish|onionyish|lemonyish|limeyish|orangeyish|appleyish|peachyish|plummyish|cherryish|grapeyish|melonyish|pineapplyish|mangoeyish|papayaeyish|kiwiyish|passionyish|guavayish|pomegranateyish|figgyish|dateyish|raisinyish|currantyish|cranberryyish|blueberryyish|blackberryyish|raspberryyish|boysenberryyish|gooseberryyish|elderberryyish|mulberryyish|loganberryyish|cloudberryyish|lingonberryyish|acaiyish|gojiyish|sea buckthornyish)\b/gi, '');
  // Remove extra spaces
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  return cleaned;
}

export async function getFoodImage(foodName: string): Promise<string> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY;
    const cleanedName = cleanFoodName(foodName);
    console.log('API Key present:', !!apiKey);
    console.log('Original food name:', foodName);
    console.log('Cleaned food name:', cleanedName);
    
    const url = `https://api.spoonacular.com/food/ingredients/autocomplete?query=${encodeURIComponent(cleanedName)}&number=1&apiKey=${apiKey}`;
    console.log('Making request to:', url);
    
    const res = await fetch(url);
    console.log('Response status:', res.status);
    console.log('Response ok:', res.ok);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('API Error response:', errorText);
      throw new Error(`Failed to fetch image: ${res.status} ${res.statusText}`);
    }
    
    const data = await res.json();
    console.log('Spoonacular response data:', data);
    
    if (data.length && data[0].image) {
      const imageUrl = `https://spoonacular.com/cdn/ingredients_100x100/${data[0].image}`;
      console.log('Returning image URL:', imageUrl);
      return imageUrl;
    }
    
    console.log('No image found, using fallback');
    return '/placeholder-food.png'; // fallback
  } catch (err) {
    console.error('Error fetching food image:', err);
    return '/placeholder-food.png';
  }
}
  