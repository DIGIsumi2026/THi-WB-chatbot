export const MAIN_MENU = `👋 Welcome to *THi Tech Showroom*!

How can we help you?

1. 🛍️ Browse Products
2. 🔎 Search Product / Model
3. 💰 Prices & Availability
4. 🛒 Purchase Inquiry
5. 📦 Order Status
6. 🛠️ Warranty & Support
7. 📍 Showroom Details
8. 👨‍💼 Talk to Sales Team

🏬 *Showroom collection only* (no delivery service).

Reply with a number, or type a model such as *D220* or *ST-9696*.
Type *MENU* to return here.`

export const CATEGORIES = [
  'Televisions & Home Entertainment',
  'Beverage and Coffee Station',
  'Kitchen Cookware & Food Prep',
  'Breakfast & Snack Makers',
  'Cooling Fans',
  'Home Maintenance & Garment Care',
  'Personal Care',
  'Computer & Game Accessories',
  'Personal Entertainment & Phone Accessories'
]

export const CATEGORY_MENU =
  `🛍️ *Browse THi Categories*\n\n` +
  CATEGORIES.map((category, index) => `${index + 1}. ${category}`).join('\n') +
  '\n\nReply with a category number or type *MENU*.'

export const SHOWROOM_INFO = `📍 *THi Flagship Showroom*
No 445, Sirimavo Bandaranike Mawatha,
Colombo 14.

📞 +94 70 709 0909
📧 info@thi.lk

🏬 Purchase collection is at the showroom. Delivery is not offered.`
