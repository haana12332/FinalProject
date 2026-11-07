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
    PostgrestVersion: "14.18"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      answers: {
        Row: {
          body: string
          created_at: string
          id: string
          question_id: string
          submitted_at: string | null
          updated_at: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          question_id: string
          submitted_at?: string | null
          updated_at?: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          question_id?: string
          submitted_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: true
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      attributes: {
        Row: {
          attribute_type: Database["public"]["Enums"]["attribute_types"]
          created_at: string
          id: string
          link_id: string | null
          node_id: string | null
          source: Database["public"]["Enums"]["attribute_sources"]
          updated_at: string
          value: Json | null
        }
        Insert: {
          attribute_type: Database["public"]["Enums"]["attribute_types"]
          created_at?: string
          id?: string
          link_id?: string | null
          node_id?: string | null
          source: Database["public"]["Enums"]["attribute_sources"]
          updated_at?: string
          value?: Json | null
        }
        Update: {
          attribute_type?: Database["public"]["Enums"]["attribute_types"]
          created_at?: string
          id?: string
          link_id?: string | null
          node_id?: string | null
          source?: Database["public"]["Enums"]["attribute_sources"]
          updated_at?: string
          value?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "attributes_link_id_fkey"
            columns: ["link_id"]
            isOneToOne: false
            referencedRelation: "links"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attributes_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      design_decisions: {
        Row: {
          attribute_id: string
          comments: string | null
          created_at: string
          determine_type: Database["public"]["Enums"]["determine_types"]
          id: string
          updated_at: string
        }
        Insert: {
          attribute_id: string
          comments?: string | null
          created_at?: string
          determine_type: Database["public"]["Enums"]["determine_types"]
          id?: string
          updated_at?: string
        }
        Update: {
          attribute_id?: string
          comments?: string | null
          created_at?: string
          determine_type?: Database["public"]["Enums"]["determine_types"]
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "design_decisions_attribute_id_fkey"
            columns: ["attribute_id"]
            isOneToOne: true
            referencedRelation: "attributes"
            referencedColumns: ["id"]
          },
        ]
      }
      guis: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          project_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          project_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          project_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "guis_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      links: {
        Row: {
          created_at: string
          id: string
          name: string
          source_node_id: string
          target_node_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          source_node_id: string
          target_node_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          source_node_id?: string
          target_node_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "links_source_node_id_fkey"
            columns: ["source_node_id"]
            isOneToOne: false
            referencedRelation: "nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "links_target_node_id_fkey"
            columns: ["target_node_id"]
            isOneToOne: false
            referencedRelation: "nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      nodes: {
        Row: {
          created_at: string
          gui_id: string
          id: string
          layer_name: string
          layer_type: Database["public"]["Enums"]["layer_types"] | null
          node_kind: Database["public"]["Enums"]["node_kinds"]
          parent_node_id: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          gui_id: string
          id?: string
          layer_name: string
          layer_type?: Database["public"]["Enums"]["layer_types"] | null
          node_kind: Database["public"]["Enums"]["node_kinds"]
          parent_node_id?: string | null
          sort_order: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          gui_id?: string
          id?: string
          layer_name?: string
          layer_type?: Database["public"]["Enums"]["layer_types"] | null
          node_kind?: Database["public"]["Enums"]["node_kinds"]
          parent_node_id?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "nodes_gui_id_fkey"
            columns: ["gui_id"]
            isOneToOne: false
            referencedRelation: "guis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nodes_parent_node_id_fkey"
            columns: ["parent_node_id"]
            isOneToOne: false
            referencedRelation: "nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      operation_logs: {
        Row: {
          created_at: string
          event_type: string
          id: string
          occurred_at: string
          payload: Json
          session_id: string
          target_node_id: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          occurred_at: string
          payload?: Json
          session_id: string
          target_node_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          occurred_at?: string
          payload?: Json
          session_id?: string
          target_node_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "operation_logs_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "operation_logs_target_node_id_fkey"
            columns: ["target_node_id"]
            isOneToOne: false
            referencedRelation: "nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          body: string
          created_at: string
          id: string
          session_id: string
          submitted_at: string | null
          updated_at: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          session_id: string
          submitted_at?: string | null
          updated_at?: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          session_id?: string
          submitted_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      requirement_documents: {
        Row: {
          comment: string | null
          created_at: string
          dod: string | null
          id: string
          name: string
          notodo: string[]
          project_id: string
          summary: string | null
          todo: string[]
          updated_at: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          dod?: string | null
          id?: string
          name: string
          notodo?: string[]
          project_id: string
          summary?: string | null
          todo?: string[]
          updated_at?: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          dod?: string | null
          id?: string
          name?: string
          notodo?: string[]
          project_id?: string
          summary?: string | null
          todo?: string[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "requirement_documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          created_at: string
          ended_at: string | null
          id: string
          method: Database["public"]["Enums"]["methods"]
          order_index: number
          participant_id: string
          project_id: string
          started_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          ended_at?: string | null
          id?: string
          method: Database["public"]["Enums"]["methods"]
          order_index: number
          participant_id: string
          project_id: string
          started_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          ended_at?: string | null
          id?: string
          method?: Database["public"]["Enums"]["methods"]
          order_index?: number
          participant_id?: string
          project_id?: string
          started_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      timeline_events: {
        Row: {
          action: string
          created_at: string
          id: string
          project_id: string
          rationale: string | null
          step_index: number
          target_node_id: string | null
          updated_at: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          project_id: string
          rationale?: string | null
          step_index: number
          target_node_id?: string | null
          updated_at?: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          project_id?: string
          rationale?: string | null
          step_index?: number
          target_node_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "timeline_events_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timeline_events_target_node_id_fkey"
            columns: ["target_node_id"]
            isOneToOne: false
            referencedRelation: "nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          id: string
          name: string
          role: Database["public"]["Enums"]["user_roles"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          role: Database["public"]["Enums"]["user_roles"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          role?: Database["public"]["Enums"]["user_roles"]
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_gui_tree: {
        Args: { p_gui_id: string }
        Returns: Json
      }
      import_page: {
        Args: { p_gui_id: string; p_nodes: Json }
        Returns: Json
      }
      reimport_page: {
        Args: { p_page_node_id: string; p_nodes: Json }
        Returns: Json
      }
      update_page_position: {
        Args: { p_page_node_id: string; p_x: number; p_y: number }
        Returns: undefined
      }
    }
    Enums: {
      attribute_sources: "figma" | "manual"
      attribute_types:
        | "x"
        | "y"
        | "width"
        | "height"
        | "opacity"
        | "fill"
        | "stroke"
        | "corner_radius"
        | "path"
        | "image_ref"
        | "characters"
        | "font_family"
        | "font_size"
        | "font_weight"
        | "line_height"
        | "letter_spacing"
        | "text_align"
        | "padding"
        | "order"
        | "gap"
        | "composition"
        | "purpose"
        | "class_or_token"
        | "visibility"
        | "scroll_behavior"
        | "responsive"
        | "variant"
        | "input_format"
        | "selection_rule"
        | "validation_rule"
        | "target_device"
        | "link_source"
        | "hit_area"
        | "trigger"
        | "transition_method"
        | "impact_scope"
        | "animation"
        | "initial_state"
        | "source_handling"
        | "return_state"
        | "passed_values"
      determine_types:
        | "static_property"
        | "child_composition"
        | "object_purpose"
        | "dynamic_property"
        | "state_transition"
        | "arrangement"
        | "class_or_token_purpose"
        | "class_or_token_reuse"
        | "interaction"
        | "state"
        | "data_input"
        | "target_device"
      layer_types: "page" | "template" | "organism" | "molecule" | "atom"
      methods: "timeline" | "structural"
      node_kinds:
        | "frame"
        | "group"
        | "rectangle"
        | "ellipse"
        | "vector"
        | "text"
        | "image"
      user_roles: "researcher" | "participant"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      attribute_sources: ["figma", "manual"],
      attribute_types: [
        "x",
        "y",
        "width",
        "height",
        "opacity",
        "fill",
        "stroke",
        "corner_radius",
        "path",
        "image_ref",
        "characters",
        "font_family",
        "font_size",
        "font_weight",
        "line_height",
        "letter_spacing",
        "text_align",
        "padding",
        "order",
        "gap",
        "composition",
        "purpose",
        "class_or_token",
        "visibility",
        "scroll_behavior",
        "responsive",
        "variant",
        "input_format",
        "selection_rule",
        "validation_rule",
        "target_device",
        "link_source",
        "hit_area",
        "trigger",
        "transition_method",
        "impact_scope",
        "animation",
        "initial_state",
        "source_handling",
        "return_state",
        "passed_values",
      ],
      determine_types: [
        "static_property",
        "child_composition",
        "object_purpose",
        "dynamic_property",
        "state_transition",
        "arrangement",
        "class_or_token_purpose",
        "class_or_token_reuse",
        "interaction",
        "state",
        "data_input",
        "target_device",
      ],
      layer_types: ["page", "template", "organism", "molecule", "atom"],
      methods: ["timeline", "structural"],
      node_kinds: [
        "frame",
        "group",
        "rectangle",
        "ellipse",
        "vector",
        "text",
        "image",
      ],
      user_roles: ["researcher", "participant"],
    },
  },
} as const
