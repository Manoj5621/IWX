from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class ProductStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    DRAFT = "draft"
    OUT_OF_STOCK = "out_of_stock"

class ProductCategory(str, Enum):
    WOMAN = "woman"
    MAN = "man"
    KIDS = "kids"
    ACCESSORIES = "accessories"
    BEAUTY = "beauty"

class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., max_length=2000)
    price: float = Field(..., gt=0)
    sale_price: Optional[float] = None
    category: ProductCategory
    brand: str = Field(..., min_length=1, max_length=100)
    sku: str = Field(..., min_length=1, max_length=50)
    status: ProductStatus = ProductStatus.ACTIVE

class ProductCreate(ProductBase):
    images: List[str] = Field(default_factory=list)
    sizes: List[str] = Field(default_factory=list)
    colors: List[str] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list)
    attributes: Optional[Dict[str, Any]] = None
    inventory_quantity: int = Field(default=0, ge=0)
    weight: Optional[float] = None
    dimensions: Optional[Dict[str, float]] = None
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None

class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    price: Optional[float] = Field(None, gt=0)
    sale_price: Optional[float] = None
    category: Optional[ProductCategory] = None
    brand: Optional[str] = Field(None, min_length=1, max_length=100)
    sku: Optional[str] = Field(None, min_length=1, max_length=50)
    status: Optional[ProductStatus] = None
    images: Optional[List[str]] = None
    sizes: Optional[List[str]] = None
    colors: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    attributes: Optional[Dict[str, Any]] = None
    inventory_quantity: Optional[int] = Field(None, ge=0)
    weight: Optional[float] = None
    dimensions: Optional[Dict[str, float]] = None
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None

class ProductInDB(ProductBase):
    id: str
    images: List[str]
    sizes: List[str]
    colors: List[str]
    tags: List[str]
    attributes: Optional[Dict[str, Any]]
    inventory_quantity: int
    weight: Optional[float]
    dimensions: Optional[Dict[str, float]]
    seo_title: Optional[str]
    seo_description: Optional[str]
    created_at: datetime
    updated_at: datetime
    created_by: str  # User ID
    rating: float = 0.0
    review_count: int = 0
    view_count: int = 0
    is_featured: bool = False
    is_trending: bool = False
    is_sustainable: bool = False

class ProductResponse(BaseModel):
    id: str
    name: str
    description: str
    price: float
    sale_price: Optional[float]
    category: ProductCategory
    brand: str
    sku: str
    status: ProductStatus
    images: List[str]
    sizes: List[str]
    colors: List[str]
    tags: List[str]
    attributes: Optional[Dict[str, Any]]
    inventory_quantity: int
    weight: Optional[float]
    dimensions: Optional[Dict[str, float]]
    seo_title: Optional[str]
    seo_description: Optional[str]
    created_at: datetime
    updated_at: datetime
    rating: float
    review_count: int
    view_count: int
    is_featured: bool
    is_trending: bool
    is_sustainable: bool

class ProductListResponse(BaseModel):
    products: List[ProductResponse]
    total: int
    page: int
    limit: int
    has_next: bool
    has_prev: bool

class ProductSearchFilters(BaseModel):
    query: Optional[str] = None
    category: Optional[ProductCategory] = None
    brand: Optional[str] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    sizes: Optional[List[str]] = None
    colors: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    status: Optional[ProductStatus] = None
    is_featured: Optional[bool] = None
    is_trending: Optional[bool] = None
    is_sustainable: Optional[bool] = None

class ProductStats(BaseModel):
    total_products: int
    active_products: int
    out_of_stock: int
    featured_products: int
    total_value: float
    average_price: float
    products_by_category: Dict[str, int]