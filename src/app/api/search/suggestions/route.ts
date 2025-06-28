// src/app/api/search/suggestions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import { Product } from '@/models/Product';
import { Category } from '@/models/Category';

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

    console.log(`Searching suggestions for: "${query}"`);

    // Search for products - FIXED: Using 'title' instead of 'name'
    const products = await Product.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } }
      ]
    })
    .populate('categories', 'name')
    .limit(5)
    .select('_id title categories price images rating')
    .lean();

    console.log(`Found ${products.length} product suggestions`);

    // Add product suggestions
    products.forEach(product => {
      const categoryNames = Array.isArray(product.categories) 
        ? product.categories.map((cat: any) => cat.name).join(', ')
        : 'Uncategorized';

      suggestions.push({
        id: product._id.toString(),
        title: product.title, // FIXED: Using title from model
        type: 'product',
        category: categoryNames,
        price: product.price,
        rating: product.rating || 4.5,
        image: product.images?.[0]?.url
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

      console.log(`Found ${categories.length} category suggestions`);

      // Add category suggestions
      categories.forEach(category => {
        suggestions.push({
          id: category._id.toString(),
          title: category.name,
          type: 'category'
        });
      });
    }

    console.log(`Returning ${suggestions.length} suggestions`);

    return NextResponse.json({
      suggestions,
      query
    });

  } catch (error) {
    console.error('Search suggestions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch search suggestions', details: error.message },
      { status: 500 }
    );
  }
}