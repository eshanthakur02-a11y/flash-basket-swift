export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          city: string
          created_at: string
          id: string
          is_default: boolean
          landmark: string | null
          line1: string
          line2: string | null
          name: string
          phone: string
          pincode: string
          state: string
          type: Database["public"]["Enums"]["address_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          city: string
          created_at?: string
          id?: string
          is_default?: boolean
          landmark?: string | null
          line1: string
          line2?: string | null
          name: string
          phone: string
          pincode: string
          state: string
          type?: Database["public"]["Enums"]["address_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          city?: string
          created_at?: string
          id?: string
          is_default?: boolean
          landmark?: string | null
          line1?: string
          line2?: string | null
          name?: string
          phone?: string
          pincode?: string
          state?: string
          type?: Database["public"]["Enums"]["address_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      app_config: {
        Row: {
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          created_at: string
          id: string
          product_id: string
          quantity: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          quantity?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          color: string | null
          created_at: string
          display_order: number
          icon: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          display_order?: number
          icon?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          color?: string | null
          created_at?: string
          display_order?: number
          icon?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      collections: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      coupons: {
        Row: {
          active: boolean
          code: string
          created_at: string
          description: string | null
          expires_at: string | null
          id: string
          max_discount: number | null
          min_order: number
          times_used: number
          type: Database["public"]["Enums"]["coupon_type"]
          usage_limit: number | null
          value: number
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          max_discount?: number | null
          min_order?: number
          times_used?: number
          type: Database["public"]["Enums"]["coupon_type"]
          usage_limit?: number | null
          value: number
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          max_discount?: number | null
          min_order?: number
          times_used?: number
          type?: Database["public"]["Enums"]["coupon_type"]
          usage_limit?: number | null
          value?: number
        }
        Relationships: []
      }
      delivery_messages: {
        Row: {
          created_at: string
          customer_id: string
          delivery_partner_id: string
          id: string
          kind: string
          message: string
          order_id: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          delivery_partner_id: string
          id?: string
          kind: string
          message: string
          order_id: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          delivery_partner_id?: string
          id?: string
          kind?: string
          message?: string
          order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_messages_delivery_partner_id_fkey"
            columns: ["delivery_partner_id"]
            isOneToOne: false
            referencedRelation: "delivery_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_messages_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_partners: {
        Row: {
          active_order_count: number
          availability_status: string
          created_at: string
          current_lat: number | null
          current_lng: number | null
          current_order_id: string | null
          eta_minutes: number | null
          id: string
          is_online: boolean
          name: string
          phone: string | null
          rating: number
          shop_id: string | null
          status_updated_at: string
          updated_at: string
          user_id: string
          vehicle: string | null
        }
        Insert: {
          active_order_count?: number
          availability_status?: string
          created_at?: string
          current_lat?: number | null
          current_lng?: number | null
          current_order_id?: string | null
          eta_minutes?: number | null
          id?: string
          is_online?: boolean
          name: string
          phone?: string | null
          rating?: number
          shop_id?: string | null
          status_updated_at?: string
          updated_at?: string
          user_id: string
          vehicle?: string | null
        }
        Update: {
          active_order_count?: number
          availability_status?: string
          created_at?: string
          current_lat?: number | null
          current_lng?: number | null
          current_order_id?: string | null
          eta_minutes?: number | null
          id?: string
          is_online?: boolean
          name?: string
          phone?: string | null
          rating?: number
          shop_id?: string | null
          status_updated_at?: string
          updated_at?: string
          user_id?: string
          vehicle?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_partners_current_order_id_fkey"
            columns: ["current_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_partners_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_dispatch_log: {
        Row: {
          attempts: number
          created_at: string
          error: string | null
          id: string
          notification_id: string | null
          request_id: number | null
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          attempts?: number
          created_at?: string
          error?: string | null
          id?: string
          notification_id?: string | null
          request_id?: number | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          attempts?: number
          created_at?: string
          error?: string | null
          id?: string
          notification_id?: string | null
          request_id?: number | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          created_at: string
          email_enabled: boolean
          in_app_enabled: boolean
          inventory_alerts: boolean
          order_updates: boolean
          promotions: boolean
          push_enabled: boolean
          system_alerts: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_enabled?: boolean
          in_app_enabled?: boolean
          inventory_alerts?: boolean
          order_updates?: boolean
          promotions?: boolean
          push_enabled?: boolean
          system_alerts?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_enabled?: boolean
          in_app_enabled?: boolean
          inventory_alerts?: boolean
          order_updates?: boolean
          promotions?: boolean
          push_enabled?: boolean
          system_alerts?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          category: string
          created_at: string
          data: Json
          id: string
          read: boolean
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          category?: string
          created_at?: string
          data?: Json
          id?: string
          read?: boolean
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          category?: string
          created_at?: string
          data?: Json
          id?: string
          read?: boolean
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      offers: {
        Row: {
          badge: string | null
          created_at: string
          created_by: string | null
          display_order: number
          ends_at: string | null
          id: string
          image_url: string
          is_active: boolean
          link_url: string | null
          scope: Database["public"]["Enums"]["offer_scope"]
          shop_id: string | null
          starts_at: string | null
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          badge?: string | null
          created_at?: string
          created_by?: string | null
          display_order?: number
          ends_at?: string | null
          id?: string
          image_url: string
          is_active?: boolean
          link_url?: string | null
          scope?: Database["public"]["Enums"]["offer_scope"]
          shop_id?: string | null
          starts_at?: string | null
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          badge?: string | null
          created_at?: string
          created_by?: string | null
          display_order?: number
          ends_at?: string | null
          id?: string
          image_url?: string
          is_active?: boolean
          link_url?: string | null
          scope?: Database["public"]["Enums"]["offer_scope"]
          shop_id?: string | null
          starts_at?: string | null
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "offers_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      onesignal_subscriptions: {
        Row: {
          created_at: string
          id: string
          last_seen_at: string
          platform: string
          player_id: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_seen_at?: string
          platform?: string
          player_id: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_seen_at?: string
          platform?: string
          player_id?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      order_audit_log: {
        Row: {
          actor_id: string | null
          actor_role: string | null
          created_at: string
          event_type: string
          from_value: string | null
          id: string
          meta: Json
          order_id: string
          to_value: string | null
        }
        Insert: {
          actor_id?: string | null
          actor_role?: string | null
          created_at?: string
          event_type: string
          from_value?: string | null
          id?: string
          meta?: Json
          order_id: string
          to_value?: string | null
        }
        Update: {
          actor_id?: string | null
          actor_role?: string | null
          created_at?: string
          event_type?: string
          from_value?: string | null
          id?: string
          meta?: Json
          order_id?: string
          to_value?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          name: string
          order_id: string
          price: number
          product_id: string | null
          quantity: number
          unit: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          name: string
          order_id: string
          price: number
          product_id?: string | null
          quantity: number
          unit?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          name?: string
          order_id?: string
          price?: number
          product_id?: string | null
          quantity?: number
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address: Json
          assignment_attempts: number
          assignment_distance_km: number | null
          assignment_expires_at: string | null
          assignment_reason: string | null
          cancel_reason: string | null
          coupon_code: string | null
          delivery_fee: number
          delivery_instruction: string | null
          delivery_lat: number | null
          delivery_lng: number | null
          delivery_type: string
          discount: number
          fast_delivery_fee: number
          handling_fee: number
          id: string
          order_number: string
          paid_at: string | null
          partner_id: string | null
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_status: Database["public"]["Enums"]["payment_status"]
          placed_at: string
          ready_for_pickup_at: string | null
          rejected_shop_ids: string[]
          shop_id: string | null
          status: Database["public"]["Enums"]["order_status"]
          subtotal: number
          tax: number
          total: number
          updated_at: string
          user_id: string
        }
        Insert: {
          address: Json
          assignment_attempts?: number
          assignment_distance_km?: number | null
          assignment_expires_at?: string | null
          assignment_reason?: string | null
          cancel_reason?: string | null
          coupon_code?: string | null
          delivery_fee?: number
          delivery_instruction?: string | null
          delivery_lat?: number | null
          delivery_lng?: number | null
          delivery_type?: string
          discount?: number
          fast_delivery_fee?: number
          handling_fee?: number
          id?: string
          order_number?: string
          paid_at?: string | null
          partner_id?: string | null
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_status?: Database["public"]["Enums"]["payment_status"]
          placed_at?: string
          ready_for_pickup_at?: string | null
          rejected_shop_ids?: string[]
          shop_id?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          subtotal: number
          tax?: number
          total: number
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: Json
          assignment_attempts?: number
          assignment_distance_km?: number | null
          assignment_expires_at?: string | null
          assignment_reason?: string | null
          cancel_reason?: string | null
          coupon_code?: string | null
          delivery_fee?: number
          delivery_instruction?: string | null
          delivery_lat?: number | null
          delivery_lng?: number | null
          delivery_type?: string
          discount?: number
          fast_delivery_fee?: number
          handling_fee?: number
          id?: string
          order_number?: string
          paid_at?: string | null
          partner_id?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"]
          payment_status?: Database["public"]["Enums"]["payment_status"]
          placed_at?: string
          ready_for_pickup_at?: string | null
          rejected_shop_ids?: string[]
          shop_id?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          tax?: number
          total?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "delivery_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_attendance: {
        Row: {
          check_in_at: string
          check_out_at: string | null
          created_at: string
          id: string
          notes: string | null
          partner_id: string
        }
        Insert: {
          check_in_at?: string
          check_out_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          partner_id: string
        }
        Update: {
          check_in_at?: string
          check_out_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          partner_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          error_code: string | null
          error_description: string | null
          id: string
          method: string | null
          order_id: string
          provider: string
          provider_order_id: string | null
          provider_payment_id: string | null
          refund_amount: number | null
          refund_id: string | null
          refunded_at: string | null
          signature: string | null
          status: Database["public"]["Enums"]["payment_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          error_code?: string | null
          error_description?: string | null
          id?: string
          method?: string | null
          order_id: string
          provider: string
          provider_order_id?: string | null
          provider_payment_id?: string | null
          refund_amount?: number | null
          refund_id?: string | null
          refunded_at?: string | null
          signature?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          error_code?: string | null
          error_description?: string | null
          id?: string
          method?: string | null
          order_id?: string
          provider?: string
          provider_order_id?: string | null
          provider_payment_id?: string | null
          refund_amount?: number | null
          refund_id?: string | null
          refunded_at?: string | null
          signature?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      product_collections: {
        Row: {
          collection_id: string
          created_at: string
          product_id: string
        }
        Insert: {
          collection_id: string
          created_at?: string
          product_id: string
        }
        Update: {
          collection_id?: string
          created_at?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_collections_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_collections_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          brand: string | null
          category_id: string | null
          created_at: string
          delivery_minutes: number
          description: string | null
          id: string
          image_url: string | null
          is_available: boolean
          is_bestseller: boolean
          is_featured: boolean
          mrp: number
          name: string
          price: number
          rating: number
          slug: string
          stock: number
          unit: string
          updated_at: string
        }
        Insert: {
          brand?: string | null
          category_id?: string | null
          created_at?: string
          delivery_minutes?: number
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean
          is_bestseller?: boolean
          is_featured?: boolean
          mrp: number
          name: string
          price: number
          rating?: number
          slug: string
          stock?: number
          unit?: string
          updated_at?: string
        }
        Update: {
          brand?: string | null
          category_id?: string | null
          created_at?: string
          delivery_minutes?: number
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean
          is_bestseller?: boolean
          is_featured?: boolean
          mrp?: number
          name?: string
          price?: number
          rating?: number
          slug?: string
          stock?: number
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          status: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          product_id: string
          rating: number
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          product_id: string
          rating: number
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          product_id?: string
          rating?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      role_requests: {
        Row: {
          created_at: string
          data: Json
          decided_at: string | null
          decided_by: string | null
          id: string
          rejection_reason: string | null
          requested_role: Database["public"]["Enums"]["app_role"]
          status: string
          submitted_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json
          decided_at?: string | null
          decided_by?: string | null
          id?: string
          rejection_reason?: string | null
          requested_role: Database["public"]["Enums"]["app_role"]
          status?: string
          submitted_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json
          decided_at?: string | null
          decided_by?: string | null
          id?: string
          rejection_reason?: string | null
          requested_role?: Database["public"]["Enums"]["app_role"]
          status?: string
          submitted_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      shop_categories: {
        Row: {
          created_at: string
          display_order: number
          id: string
          image_url: string
          is_active: boolean
          name: string
          shop_id: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          image_url: string
          is_active?: boolean
          name: string
          shop_id: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string
          is_active?: boolean
          name?: string
          shop_id?: string
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shop_categories_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_category_items: {
        Row: {
          category_id: string
          created_at: string
          product_id: string
        }
        Insert: {
          category_id: string
          created_at?: string
          product_id: string
        }
        Update: {
          category_id?: string
          created_at?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shop_category_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "shop_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shop_category_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_collection_items: {
        Row: {
          collection_id: string
          created_at: string
          product_id: string
        }
        Insert: {
          collection_id: string
          created_at?: string
          product_id: string
        }
        Update: {
          collection_id?: string
          created_at?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shop_collection_items_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "shop_collections"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_collections: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          shop_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          shop_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          shop_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      shop_delivery_assignments: {
        Row: {
          assigned_by: string | null
          created_at: string
          delivery_partner_id: string
          id: string
          shop_id: string
        }
        Insert: {
          assigned_by?: string | null
          created_at?: string
          delivery_partner_id: string
          id?: string
          shop_id: string
        }
        Update: {
          assigned_by?: string | null
          created_at?: string
          delivery_partner_id?: string
          id?: string
          shop_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shop_delivery_assignments_delivery_partner_id_fkey"
            columns: ["delivery_partner_id"]
            isOneToOne: false
            referencedRelation: "delivery_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shop_delivery_assignments_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_products: {
        Row: {
          created_at: string
          id: string
          is_available: boolean
          price: number
          product_id: string
          shop_id: string
          stock: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_available?: boolean
          price: number
          product_id: string
          shop_id: string
          stock?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_available?: boolean
          price?: number
          product_id?: string
          shop_id?: string
          stock?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shop_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shop_products_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      shops: {
        Row: {
          address: string
          city: string
          created_at: string
          id: string
          is_open: boolean
          latitude: number
          longitude: number
          name: string
          owner_id: string | null
          phone: string | null
          pincode: string
          service_radius_km: number
          updated_at: string
        }
        Insert: {
          address: string
          city: string
          created_at?: string
          id?: string
          is_open?: boolean
          latitude: number
          longitude: number
          name: string
          owner_id?: string | null
          phone?: string | null
          pincode: string
          service_radius_km?: number
          updated_at?: string
        }
        Update: {
          address?: string
          city?: string
          created_at?: string
          id?: string
          is_open?: boolean
          latitude?: number
          longitude?: number
          name?: string
          owner_id?: string | null
          phone?: string | null
          pincode?: string
          service_radius_km?: number
          updated_at?: string
        }
        Relationships: []
      }
      support_agents: {
        Row: {
          created_at: string
          display_name: string | null
          is_active: boolean
          max_concurrent: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          is_active?: boolean
          max_concurrent?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          is_active?: boolean
          max_concurrent?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      support_messages: {
        Row: {
          body: string
          created_at: string
          id: string
          is_internal_note: boolean
          sender_id: string
          sender_role: string
          ticket_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          is_internal_note?: boolean
          sender_id: string
          sender_role: string
          ticket_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          is_internal_note?: boolean
          sender_id?: string
          sender_role?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          category: Database["public"]["Enums"]["ticket_category"]
          closed_at: string | null
          created_at: string
          description: string
          first_response_at: string | null
          id: string
          order_id: string | null
          partner_id: string | null
          priority: Database["public"]["Enums"]["ticket_priority"]
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          role_at_creation: string
          shop_id: string | null
          status: Database["public"]["Enums"]["ticket_status"]
          ticket_number: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          category: Database["public"]["Enums"]["ticket_category"]
          closed_at?: string | null
          created_at?: string
          description: string
          first_response_at?: string | null
          id?: string
          order_id?: string | null
          partner_id?: string | null
          priority?: Database["public"]["Enums"]["ticket_priority"]
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          role_at_creation: string
          shop_id?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          ticket_number?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          category?: Database["public"]["Enums"]["ticket_category"]
          closed_at?: string | null
          created_at?: string
          description?: string
          first_response_at?: string | null
          id?: string
          order_id?: string | null
          partner_id?: string | null
          priority?: Database["public"]["Enums"]["ticket_priority"]
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          role_at_creation?: string
          shop_id?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          ticket_number?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "delivery_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          assigned_to: string
          id: string
          ticket_id: string
          unassigned_at: string | null
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          assigned_to: string
          id?: string
          ticket_id: string
          unassigned_at?: string | null
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          assigned_to?: string
          id?: string
          ticket_id?: string
          unassigned_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_assignments_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_attachments: {
        Row: {
          created_at: string
          file_name: string | null
          file_url: string
          id: string
          message_id: string | null
          mime: string | null
          ticket_id: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          file_name?: string | null
          file_url: string
          id?: string
          message_id?: string | null
          mime?: string | null
          ticket_id: string
          uploaded_by: string
        }
        Update: {
          created_at?: string
          file_name?: string | null
          file_url?: string
          id?: string
          message_id?: string | null
          mime?: string | null
          ticket_id?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_attachments_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "support_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_attachments_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wishlist_items: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      actor_role_label: { Args: never; Returns: string }
      admin_approve_delivery_request: {
        Args: {
          _name?: string
          _phone?: string
          _request_id: string
          _shop_id: string
          _vehicle?: string
        }
        Returns: string
      }
      admin_approve_shopkeeper_request: {
        Args: {
          _address?: string
          _city?: string
          _lat?: number
          _lng?: number
          _phone?: string
          _pincode?: string
          _radius?: number
          _request_id: string
          _shop_id?: string
          _shop_name?: string
        }
        Returns: string
      }
      admin_assign_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: undefined
      }
      admin_assign_shop_owner: {
        Args: { _shop_id: string; _user_email: string }
        Returns: string
      }
      admin_create_delivery_partner: {
        Args: {
          _name: string
          _phone: string
          _user_email?: string
          _vehicle?: string
        }
        Returns: string
      }
      admin_create_shopkeeper: {
        Args: {
          _address: string
          _city: string
          _lat: number
          _lng: number
          _phone?: string
          _pincode: string
          _radius?: number
          _shop_name: string
          _user_email: string
        }
        Returns: string
      }
      admin_list_complaints: {
        Args: never
        Returns: {
          address_line: string
          category: string
          city: string
          created_at: string
          description: string
          full_name: string
          id: string
          phone: string
          pincode: string
          role_at_creation: string
          shop_address: string
          shop_name: string
          shop_phone: string
          status: string
          ticket_number: string
          title: string
          user_id: string
        }[]
      }
      admin_list_payments: {
        Args: {
          _limit?: number
          _status?: Database["public"]["Enums"]["payment_status"]
        }
        Returns: {
          amount: number
          created_at: string
          error_code: string
          error_description: string
          id: string
          method: string
          order_id: string
          provider: string
          provider_payment_id: string
          refund_amount: number
          status: Database["public"]["Enums"]["payment_status"]
          user_id: string
        }[]
      }
      admin_list_role_requests: {
        Args: { _status?: string }
        Returns: {
          data: Json
          decided_at: string
          email: string
          full_name: string
          id: string
          phone: string
          rejection_reason: string
          requested_role: Database["public"]["Enums"]["app_role"]
          status: string
          submitted_at: string
          user_id: string
        }[]
      }
      admin_list_shops: {
        Args: never
        Returns: {
          address: string
          city: string
          created_at: string
          id: string
          is_open: boolean
          latitude: number
          longitude: number
          name: string
          owner_email: string
          owner_id: string
          phone: string
          pincode: string
          service_radius_km: number
          updated_at: string
        }[]
      }
      admin_list_users: {
        Args: never
        Returns: {
          address: string
          created_at: string
          email: string
          full_name: string
          id: string
          pending_request_count: number
          phone: string
          roles: Database["public"]["Enums"]["app_role"][]
          status: string
        }[]
      }
      admin_live_partners: {
        Args: never
        Returns: {
          active_order_count: number
          availability_status: string
          current_order_id: string
          current_order_number: string
          eta_minutes: number
          is_online: boolean
          name: string
          partner_id: string
          phone: string
          rating: number
          shop_id: string
          shop_name: string
          status_updated_at: string
          vehicle: string
        }[]
      }
      admin_partner_performance: {
        Args: never
        Returns: {
          avg_minutes_30d: number
          hours_today: number
          is_online: boolean
          name: string
          on_time_pct_30d: number
          orders_30d: number
          orders_7d: number
          orders_today: number
          partner_id: string
          phone: string
          rating: number
        }[]
      }
      admin_payments_summary: { Args: never; Returns: Json }
      admin_reassign_partner: {
        Args: { _order_id: string; _partner_id: string }
        Returns: undefined
      }
      admin_record_refund: {
        Args: { _amount: number; _payment_id: string; _refund_id: string }
        Returns: undefined
      }
      admin_reject_role_request: {
        Args: { _reason?: string; _request_id: string }
        Returns: undefined
      }
      admin_remove_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: undefined
      }
      admin_remove_support_agent: {
        Args: { _user_id: string }
        Returns: undefined
      }
      admin_set_support_agent: {
        Args: { _is_active?: boolean; _user_email: string }
        Returns: string
      }
      admin_set_user_status: {
        Args: { _status: string; _user_id: string }
        Returns: undefined
      }
      admin_support_stats: { Args: never; Returns: Json }
      admin_transfer_partner: {
        Args: { _partner_id: string; _shop_id: string }
        Returns: undefined
      }
      admin_unassign_shop_owner: { Args: { _shop_id: string }; Returns: string }
      admin_update_order_status: {
        Args: {
          _order_id: string
          _status: Database["public"]["Enums"]["order_status"]
        }
        Returns: undefined
      }
      assign_ticket: {
        Args: { _agent_id: string; _ticket_id: string }
        Returns: undefined
      }
      cancel_order: {
        Args: { _order_id: string; _reason: string }
        Returns: undefined
      }
      create_delivery_partner: {
        Args: {
          _name: string
          _phone: string
          _shop_id?: string
          _user_email?: string
          _vehicle?: string
        }
        Returns: string
      }
      create_support_ticket: {
        Args: {
          _category: Database["public"]["Enums"]["ticket_category"]
          _description: string
          _order_id?: string
          _partner_id?: string
          _shop_id?: string
          _title: string
        }
        Returns: string
      }
      current_user_partner_id: { Args: never; Returns: string }
      delete_delivery_partner: {
        Args: { _partner_id: string }
        Returns: undefined
      }
      find_nearest_partner_for_order: {
        Args: { _exclude?: string[]; _order_id: string }
        Returns: string
      }
      find_nearest_shop_for_cart: {
        Args: {
          _exclude?: string[]
          _lat: number
          _lng: number
          _user_id: string
        }
        Returns: string
      }
      find_nearest_shop_for_order: {
        Args: { _order_id: string }
        Returns: string
      }
      get_order_partner_tracking: {
        Args: { _order_id: string }
        Returns: {
          availability_status: string
          current_lat: number
          current_lng: number
          eta_minutes: number
          id: string
          name: string
          rating: number
          status_updated_at: string
          vehicle: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      haversine_km: {
        Args: { lat1: number; lat2: number; lng1: number; lng2: number }
        Returns: number
      }
      notify_role: {
        Args: {
          _body: string
          _category?: string
          _data?: Json
          _role: Database["public"]["Enums"]["app_role"]
          _title: string
        }
        Returns: number
      }
      notify_user: {
        Args: {
          _body: string
          _category?: string
          _data?: Json
          _title: string
          _user_id: string
        }
        Returns: string
      }
      partner_accept_order: { Args: { _order_id: string }; Returns: undefined }
      partner_available_orders: {
        Args: never
        Returns: {
          area_pincode: string
          city: string
          id: string
          item_count: number
          order_number: string
          placed_at: string
          shop_name: string
          total: number
        }[]
      }
      partner_check_in: { Args: never; Returns: string }
      partner_check_out: { Args: never; Returns: undefined }
      partner_decline_assignment: {
        Args: { _order_id: string }
        Returns: undefined
      }
      partner_is_on_order: { Args: { _partner_id: string }; Returns: boolean }
      partner_mark_delivered: {
        Args: { _order_id: string }
        Returns: undefined
      }
      partner_send_eta_update: {
        Args: {
          _custom_message?: string
          _eta_minutes?: number
          _kind: string
          _order_id: string
        }
        Returns: string
      }
      partner_send_message: {
        Args: { _custom_message?: string; _kind: string; _order_id: string }
        Returns: string
      }
      partner_today_hours: { Args: { _partner_id: string }; Returns: number }
      partner_update_status: {
        Args: { _eta_minutes?: number; _order_id?: string; _status: string }
        Returns: undefined
      }
      place_order: {
        Args: {
          _address: Json
          _coupon_code?: string
          _delivery_instruction?: string
          _delivery_type?: string
          _payment_method: Database["public"]["Enums"]["payment_method"]
        }
        Returns: string
      }
      post_ticket_message: {
        Args: { _body: string; _is_internal?: boolean; _ticket_id: string }
        Returns: string
      }
      reassign_stale_orders: { Args: never; Returns: number }
      restore_order_stock: { Args: { _order_id: string }; Returns: undefined }
      send_onesignal_push: {
        Args: { _notification_id: string }
        Returns: undefined
      }
      shop_accept_order: { Args: { _order_id: string }; Returns: undefined }
      shop_assign_partner: {
        Args: { _order_id: string; _partner_id: string }
        Returns: undefined
      }
      shop_available_partners: {
        Args: { _shop_id: string }
        Returns: {
          is_online: boolean
          name: string
          on_team: boolean
          partner_id: string
          phone: string
          rating: number
          vehicle: string
        }[]
      }
      shop_list_team: {
        Args: { _shop_id: string }
        Returns: {
          active_order_count: number
          availability_status: string
          is_online: boolean
          name: string
          partner_id: string
          phone: string
          rating: number
          vehicle: string
        }[]
      }
      shop_live_team: {
        Args: { _shop_id: string }
        Returns: {
          active_order_count: number
          availability_status: string
          current_order_id: string
          current_order_number: string
          eta_minutes: number
          is_online: boolean
          name: string
          partner_id: string
          phone: string
          rating: number
          status_updated_at: string
          vehicle: string
        }[]
      }
      shop_mark_collected: { Args: { _order_id: string }; Returns: undefined }
      shop_mark_packed: { Args: { _order_id: string }; Returns: undefined }
      shop_partner_performance: {
        Args: { _shop_id: string }
        Returns: {
          avg_minutes_today: number
          hours_today: number
          is_online: boolean
          name: string
          on_time_pct: number
          orders_7d: number
          orders_today: number
          partner_id: string
          phone: string
          rating: number
        }[]
      }
      shop_reject_order: { Args: { _order_id: string }; Returns: undefined }
      shop_set_team: {
        Args: { _partner_ids: string[]; _shop_id: string }
        Returns: undefined
      }
      submit_role_request: {
        Args: { _data: Json; _role: Database["public"]["Enums"]["app_role"] }
        Returns: string
      }
      support_list_complaints: {
        Args: never
        Returns: {
          address_line: string
          assigned_to: string
          category: string
          city: string
          created_at: string
          description: string
          full_name: string
          id: string
          phone: string
          pincode: string
          role_at_creation: string
          shop_address: string
          shop_name: string
          shop_phone: string
          status: string
          ticket_number: string
          title: string
          user_id: string
        }[]
      }
      support_ticket_context: { Args: { _ticket_id: string }; Returns: Json }
      update_ticket_status:
        | {
            Args: {
              _status: Database["public"]["Enums"]["ticket_status"]
              _ticket_id: string
            }
            Returns: undefined
          }
        | {
            Args: {
              _notes?: string
              _status: Database["public"]["Enums"]["ticket_status"]
              _ticket_id: string
            }
            Returns: undefined
          }
      user_owns_shop_for_order: {
        Args: { _order_id: string }
        Returns: boolean
      }
      validate_coupon: {
        Args: { _code: string; _subtotal: number }
        Returns: {
          code: string
          description: string
          discount: number
        }[]
      }
    }
    Enums: {
      address_type: "home" | "work" | "other"
      app_role: "admin" | "customer" | "shopkeeper" | "delivery" | "support"
      coupon_type: "percent" | "flat"
      offer_scope: "global" | "shop"
      order_status:
        | "placed"
        | "payment_confirmed"
        | "packing"
        | "out_for_delivery"
        | "delivered"
        | "cancelled"
        | "awaiting_shop"
        | "accepted_by_shop"
        | "packed"
        | "no_shop_available"
      payment_method: "razorpay" | "cod"
      payment_status:
        | "pending"
        | "paid"
        | "failed"
        | "refund_initiated"
        | "refunded"
        | "cod"
      ticket_category:
        | "order_issue"
        | "payment_issue"
        | "refund_issue"
        | "delivery_issue"
        | "product_issue"
        | "shop_issue"
        | "account_issue"
        | "technical_issue"
      ticket_priority: "low" | "normal" | "high"
      ticket_status: "open" | "assigned" | "in_progress" | "resolved" | "closed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      address_type: ["home", "work", "other"],
      app_role: ["admin", "customer", "shopkeeper", "delivery", "support"],
      coupon_type: ["percent", "flat"],
      offer_scope: ["global", "shop"],
      order_status: [
        "placed",
        "payment_confirmed",
        "packing",
        "out_for_delivery",
        "delivered",
        "cancelled",
        "awaiting_shop",
        "accepted_by_shop",
        "packed",
        "no_shop_available",
      ],
      payment_method: ["razorpay", "cod"],
      payment_status: [
        "pending",
        "paid",
        "failed",
        "refund_initiated",
        "refunded",
        "cod",
      ],
      ticket_category: [
        "order_issue",
        "payment_issue",
        "refund_issue",
        "delivery_issue",
        "product_issue",
        "shop_issue",
        "account_issue",
        "technical_issue",
      ],
      ticket_priority: ["low", "normal", "high"],
      ticket_status: ["open", "assigned", "in_progress", "resolved", "closed"],
    },
  },
} as const
