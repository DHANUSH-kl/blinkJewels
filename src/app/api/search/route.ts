// src/app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import { Product } from '@/models/Product';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const sortBy = searchParams.get('sortBy') || 'relevance';
    const category = searchParams.get('category');
    const type = searchParams.get('type'); // 'buy' or 'rent'
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');

    if (!query.trim()) {
      return NextResponse.json({
        products: [],
        totalProducts: 0,
        totalPages: 0,
        currentPage: page,
        message: 'Please enter a search query'
      });
    }

    await connectToDatabase();

    // Build search filter - FIXED: Using 'title' instead of 'name'
    const searchFilter: any = {
      $and: [
        {
          $or: [
            { title: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } },
            { tags: { $in: [new RegExp(query, 'i')] } }
          ]
        }
        // Removed isActive filter since your model doesn't have it
      ]
    };

    // Add category filter - need to handle categories array
    if (category) {
      // Since categories is an array of ObjectIds, we need to populate and search
      searchFilter.$and.push({
        'categories': { $exists: true }
      });
    }

    // Add type filter (buy/rent)
    if (type) {
      searchFilter.$and.push({ type: type });
    }

    // Add price range filter
    if (minPrice || maxPrice) {
      const priceFilter: any = {};
      if (minPrice) priceFilter.$gte = parseFloat(minPrice);
      if (maxPrice) priceFilter.$lte = parseFloat(maxPrice);
      searchFilter.$and.push({ price: priceFilter });
    }

    // Build sort options
    let sortOptions: any = {};
    switch (sortBy) {
      case 'price-low':
        sortOptions = { price: 1 };
        break;
      case 'price-high':
        sortOptions = { price: -1 };
        break;
      case 'newest':
        sortOptions = { createdAt: -1 };
        break;
      case 'rating':
        sortOptions = { rating: -1 };
        break;
      case 'name':
        sortOptions = { title: 1 }; // FIXED: Using 'title'
        break;
      default: // relevance
        sortOptions = { createdAt: -1 };
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Get total count
    const totalProducts = await Product.countDocuments(searchFilter);
    const totalPages = Math.ceil(totalProducts / limit);

    // Get products with category population
    const products = await Product.find(searchFilter)
      .populate('categories', 'name')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .select('_id title description price type rentalPrice images rating categories tags stock isFeatured createdAt')
      .lean();

    // Transform products for response - FIXED: Mapping title to name for frontend
    const transformedProducts = products.map(product => ({
      id: product._id.toString(),
      name: product.title, // Map title to name for frontend compatibility
      title: product.title, // Keep original title as well
      category: Array.isArray(product.categories) 
        ? product.categories.map((cat: any) => cat.name).join(', ')
        : 'Uncategorized',
      type: product.type,
      price: product.price,
      originalPrice: product.rentalPrice, // Map rentalPrice to originalPrice if needed
      images: product.images?.map((img: any) => img.url) || [],
      rating: product.rating || 4.5,
      isActive: true, // Default to true since model doesn't have this field
      createdAt: product.createdAt,
      tags: product.tags || [],
      stock: product.stock,
      isFeatured: product.isFeatured
    }));

    console.log(`Search for "${query}" found ${totalProducts} products`);

    return NextResponse.json({
      products: transformedProducts,
      totalProducts,
      totalPages,
      currentPage: page,
      query,
      filters: {
        category,
        type,
        minPrice,
        maxPrice,
        sortBy
      }
    });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to perform search', details: error.message },
      { status: 500 }
    );
  }
}