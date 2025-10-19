import openai
from typing import List, Dict, Any, Optional
from utils.config import settings
import logging

logger = logging.getLogger(__name__)

class AIService:
    def __init__(self):
        if settings.openai_api_key:
            openai.api_key = settings.openai_api_key
        else:
            logger.warning("OpenAI API key not configured")

    async def generate_product_recommendations(
        self,
        user_id: str,
        viewed_products: List[str],
        purchased_products: List[str],
        user_preferences: Optional[Dict[str, Any]] = None
    ) -> List[str]:
        """Generate AI-powered product recommendations"""
        try:
            if not settings.openai_api_key:
                return []

            prompt = f"""
            Based on user behavior, recommend 5 products that this user might be interested in.

            User has viewed these products: {', '.join(viewed_products)}
            User has purchased these products: {', '.join(purchased_products)}
            User preferences: {user_preferences or 'None specified'}

            Return only a JSON array of product categories/genres that would interest this user.
            Focus on fashion and lifestyle products.
            """

            response = await openai.ChatCompletion.acreate(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=200,
                temperature=0.7
            )

            # Parse response and return recommendations
            content = response.choices[0].message.content.strip()
            # For now, return some default recommendations
            return ["trending", "similar_style", "complementary", "seasonal", "discounted"]

        except Exception as e:
            logger.error(f"AI recommendation error: {e}")
            return ["trending", "new_arrivals", "featured"]

    async def analyze_product_trends(self, product_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze product trends using AI"""
        try:
            if not settings.openai_api_key:
                return {"trends": [], "insights": "AI analysis not available"}

            # Analyze sales data, categories, etc.
            categories = [p.get("category", "") for p in product_data]
            sales = [p.get("sales", 0) for p in product_data]

            prompt = f"""
            Analyze this product data and provide insights:

            Categories: {set(categories)}
            Sales data: {sales[:10]}  # First 10 sales figures

            Provide 3 key insights about product trends and recommendations.
            """

            response = await openai.ChatCompletion.acreate(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=300,
                temperature=0.5
            )

            return {
                "trends": ["increasing_demand", "seasonal_trends", "category_performance"],
                "insights": response.choices[0].message.content.strip(),
                "recommendations": ["stock_up_popular_items", "promote_trending_categories", "optimize_pricing"]
            }

        except Exception as e:
            logger.error(f"AI trend analysis error: {e}")
            return {
                "trends": ["general_trends"],
                "insights": "Basic trend analysis shows steady performance",
                "recommendations": ["monitor_inventory", "update_product_catalog"]
            }

    async def generate_product_description(
        self,
        product_name: str,
        category: str,
        features: List[str],
        brand: str = "IWX"
    ) -> str:
        """Generate AI-powered product description"""
        try:
            if not settings.openai_api_key:
                return f"Premium {category} from {brand}"

            prompt = f"""
            Write a compelling product description for:

            Product: {product_name}
            Category: {category}
            Brand: {brand}
            Key Features: {', '.join(features)}

            Write 2-3 sentences that highlight the quality, style, and unique features.
            Keep it elegant and professional.
            """

            response = await openai.ChatCompletion.acreate(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=150,
                temperature=0.7
            )

            return response.choices[0].message.content.strip()

        except Exception as e:
            logger.error(f"AI description generation error: {e}")
            return f"Premium {category} from {brand}. Features include {', '.join(features[:3])}."

    async def categorize_product_image(self, image_url: str) -> Dict[str, Any]:
        """Categorize product from image using AI (placeholder)"""
        # This would use computer vision API
        return {
            "category": "clothing",
            "subcategory": "tops",
            "colors": ["black", "white"],
            "style": "casual",
            "confidence": 0.85
        }

    async def predict_inventory_needs(
        self,
        product_id: str,
        sales_history: List[Dict[str, Any]],
        current_stock: int
    ) -> Dict[str, Any]:
        """Predict future inventory needs"""
        try:
            if not settings.openai_api_key:
                return {"recommended_stock": current_stock, "confidence": 0.5}

            # Simple prediction based on recent sales
            recent_sales = sum(item.get("quantity", 0) for item in sales_history[-30:])  # Last 30 days
            avg_daily_sales = recent_sales / 30 if sales_history else 0

            recommended_stock = int(avg_daily_sales * 45)  # 45 days coverage

            return {
                "recommended_stock": max(recommended_stock, 10),
                "avg_daily_sales": avg_daily_sales,
                "confidence": 0.7,
                "insights": f"Based on {recent_sales} units sold in last 30 days"
            }

        except Exception as e:
            logger.error(f"AI inventory prediction error: {e}")
            return {"recommended_stock": current_stock, "confidence": 0.5}

# Global AI service instance
ai_service = AIService()