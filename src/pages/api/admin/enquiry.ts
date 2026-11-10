import type { APIRoute } from 'astro'
import { getMongoDb } from '@/lib/mongodb'
import { EnquiryItem } from '@/types/store'

export const prerender = false

function clamp(val: string | undefined, maxLen: number, fallback: string): string {
  const v = (val || fallback).trim()
  return v.length > maxLen ? v.slice(0, maxLen) : v
}

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body: Partial<EnquiryItem> = await request.json()

    const newEnquiry: EnquiryItem = {
      id: body.id || `ord-${Date.now()}`,
      timestamp:
        body.timestamp ||
        new Date().toLocaleString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      productName: clamp(body.productName, 200, 'General Store Enquiry'),
      color: clamp(body.color, 100, 'Default'),
      size: clamp(body.size, 100, 'Standard'),
      quantity: Math.max(1, Math.min(5000, Number(body.quantity) || 1)),
      customNotes: clamp(body.customNotes, 1000, ''),
      source: (body.source || 'WhatsApp Checkout') as EnquiryItem['source'],
      completed: Boolean(body.completed),
      customerName: body.customerName ? clamp(body.customerName, 100, '') : undefined,
      customerPhone: body.customerPhone ? clamp(body.customerPhone, 20, '') : undefined,
      address: body.address
        ? {
            fullName: clamp(body.address.fullName, 100, ''),
            phoneNumber: clamp(body.address.phoneNumber, 20, ''),
            houseNumber: clamp(body.address.houseNumber, 200, ''),
            streetAddress: clamp(body.address.streetAddress, 200, ''),
            landmark: clamp(body.address.landmark, 200, ''),
            city: clamp(body.address.city, 100, ''),
            state: clamp(body.address.state, 100, ''),
            pincode: clamp(body.address.pincode, 10, ''),
            addressType: body.address.addressType || 'Home',
          }
        : undefined,
      items: Array.isArray(body.items) ? body.items : undefined,
      totalAmount: typeof body.totalAmount === 'number' ? body.totalAmount : undefined,
      status: body.status || 'New',
    }

    const db = await getMongoDb(5000, locals)
    if (db) {
      await db.collection('enquiries').insertOne(newEnquiry)
      await db.collection('config').updateOne(
        { _id: 'store_config' as any },
        { $push: { enquiries: { $each: [newEnquiry], $position: 0 } } } as any
      )
    }

    return new Response(JSON.stringify({ success: true, enquiry: newEnquiry }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    console.error('Failed to log enquiry:', err)
    return new Response(JSON.stringify({ error: err.message || 'Failed to log enquiry' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export const PATCH: APIRoute = async ({ request, locals }) => {
  try {
    const { id, status, completed } = await request.json()
    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing enquiry id' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const updateFields: any = {}
    if (status !== undefined) updateFields.status = status
    if (completed !== undefined) updateFields.completed = completed

    const db = await getMongoDb(5000, locals)
    if (db) {
      await db.collection('enquiries').updateOne({ id }, { $set: updateFields })
      await db.collection('config').updateOne(
        { _id: 'store_config' as any, 'enquiries.id': id },
        {
          $set: {
            'enquiries.$.status': status,
            'enquiries.$.completed': completed,
          },
        } as any
      )
    }

    return new Response(JSON.stringify({ success: true, id, updateFields }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    console.error('Failed to update enquiry:', err)
    return new Response(JSON.stringify({ error: err.message || 'Failed to update enquiry' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export const DELETE: APIRoute = async ({ request, locals }) => {
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get('id')
    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing enquiry id' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const db = await getMongoDb(5000, locals)
    if (db) {
      await db.collection('enquiries').deleteOne({ id })
      await db.collection('config').updateOne(
        { _id: 'store_config' as any },
        { $pull: { enquiries: { id } } } as any
      )
    }

    return new Response(JSON.stringify({ success: true, deletedId: id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    console.error('Failed to delete enquiry:', err)
    return new Response(JSON.stringify({ error: err.message || 'Failed to delete enquiry' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
