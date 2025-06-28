// src/app/api/search/suggestions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import  {connectToDatabase}  from '@/lib/mongoose';
import {Product} from '@/models/Product';
import {Category} from '@/models/Category';

interface SearchSuggestion {
  id: string;
  title: string;
  type: 'product' | 'category';
  category?: string;
  price?: number;
  rating?: number;
  image?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    await connectToDatabase();

    const suggestions: SearchSuggestion[] = [];

    // Search for products
    const products = await Product.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } }
      ],
      isActive: true
    })
    .limit(5)
    .select('_id name category price images rating')
    .lean();

    // Add product suggestions
    products.forEach(product => {
      suggestions.push({
        id: product._id.toString(),
        title: product.name,
        type: 'product',
        category: product.category,
        price: product.price,
        rating: product.rating || 4.5,
        image: product.images?.[0]
      });
    });

    // Search for categories if we have fewer than 5 suggestions
    if (suggestions.length < 5) {
      const categories = await Category.find({
        name: { $regex: query, $options: 'i' }
      })
      .limit(5 - suggestions.length)
      .select('_id name slug')
      .lean();

      // Add category suggestions
      categories.forEach(category => {
        suggestions.push({
          id: category._id.toString(),
          title: category.name,
          type: 'category'
        });
      });
    }

    return NextResponse.json({
      suggestions,
      query
    });

  } catch (error) {
    console.error('Search suggestions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch search suggestions' },
      { status: 500 }
    );
  }
}