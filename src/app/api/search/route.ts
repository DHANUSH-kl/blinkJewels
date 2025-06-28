// src/app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import  {connectToDatabase}  from '@/lib/mongoose';
import {Product} from '@/models/Product';

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

    // Build search filter
    const searchFilter: any = {
      $and: [
        {
          $or: [
            { name: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } },
            { tags: { $in: [new RegExp(query, 'i')] } },
            { category: { $regex: query, $options: 'i' } }
          ]
        },
        { isActive: true }
      ]
    };

    // Add category filter
    if (category) {
      searchFilter.$and.push({ category: category });
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
        sortOptions = { name: 1 };
        break;
      default: // relevance
        // For relevance, we can use text score if text index exists,
        // otherwise use a combination of factors
        sortOptions = { createdAt: -1 };
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Get total count
    const totalProducts = await Product.countDocuments(searchFilter);
    const totalPages = Math.ceil(totalProducts / limit);

    // Get products
    const products = await Product.find(searchFilter)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .select('_id name category type price originalPrice images rating isActive createdAt tags')
      .lean();

    // Transform products for response
    const transformedProducts = products.map(product => ({
      id: product._id.toString(),
      name: product.name,
      category: product.category,
      type: product.type,
      price: product.price,
      originalPrice: product.originalPrice,
      images: product.images || [],
      rating: product.rating || 4.5,
      isActive: product.isActive,
      createdAt: product.createdAt,
      tags: product.tags || []
    }));

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
      { error: 'Failed to perform search' },
      { status: 500 }
    );
  }
}