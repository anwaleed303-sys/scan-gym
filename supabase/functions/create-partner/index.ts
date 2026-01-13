// // // @ts-nocheck
// // import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// // import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

// // const corsHeaders = {
// //   "Access-Control-Allow-Origin": "*",
// //   "Access-Control-Allow-Headers":
// //     "authorization, x-client-info, apikey, content-type",
// // };

// // serve(async (req: Request) => {
// //   // Handle CORS preflight
// //   if (req.method === "OPTIONS") {
// //     return new Response(null, { headers: corsHeaders });
// //   }

// //   try {
// //     const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
// //     const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
// //     const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

// //     // Create admin client with service role
// //     const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
// //       auth: { autoRefreshToken: false, persistSession: false },
// //     });

// //     // Create regular client to verify the caller is admin
// //     const authHeader = req.headers.get("Authorization")!;
// //     const callerClient = createClient(supabaseUrl, supabaseAnonKey, {
// //       global: { headers: { Authorization: authHeader } },
// //     });

// //     // Verify caller is admin
// //     const {
// //       data: { user: caller },
// //       error: callerError,
// //     } = await callerClient.auth.getUser();
// //     if (callerError || !caller) {
// //       return new Response(JSON.stringify({ error: "Unauthorized" }), {
// //         status: 401,
// //         headers: { ...corsHeaders, "Content-Type": "application/json" },
// //       });
// //     }

// //     // Check if caller has admin role
// //     const { data: roleData } = await adminClient
// //       .from("user_roles")
// //       .select("role")
// //       .eq("user_id", caller.id)
// //       .eq("role", "admin")
// //       .maybeSingle();

// //     if (!roleData) {
// //       return new Response(JSON.stringify({ error: "Admin access required" }), {
// //         status: 403,
// //         headers: { ...corsHeaders, "Content-Type": "application/json" },
// //       });
// //     }

// //     // Get request body
// //     const { email, password, fullName, gymId } = await req.json();

// //     if (!email || !password || !fullName || !gymId) {
// //       return new Response(
// //         JSON.stringify({ error: "Missing required fields" }),
// //         {
// //           status: 400,
// //           headers: { ...corsHeaders, "Content-Type": "application/json" },
// //         }
// //       );
// //     }

// //     // Check if user already exists
// //     const { data: existingUsers } = await adminClient.auth.admin.listUsers();
// //     const existingUser = existingUsers?.users?.find(
// //       (u: any) => u.email === email
// //     );

// //     if (existingUser) {
// //       return new Response(
// //         JSON.stringify({ error: "A user with this email already exists" }),
// //         {
// //           status: 400,
// //           headers: { ...corsHeaders, "Content-Type": "application/json" },
// //         }
// //       );
// //     }

// //     // Create user with admin API (doesn't affect current session)
// //     const { data: newUser, error: createError } =
// //       await adminClient.auth.admin.createUser({
// //         email,
// //         password,
// //         email_confirm: true, // Auto-confirm email
// //         user_metadata: { full_name: fullName },
// //       });

// //     if (createError) {
// //       console.error("Create user error:", createError);
// //       return new Response(JSON.stringify({ error: createError.message }), {
// //         status: 400,
// //         headers: { ...corsHeaders, "Content-Type": "application/json" },
// //       });
// //     }

// //     if (!newUser.user) {
// //       return new Response(JSON.stringify({ error: "Failed to create user" }), {
// //         status: 500,
// //         headers: { ...corsHeaders, "Content-Type": "application/json" },
// //       });
// //     }

// //     // Add partner role
// //     const { error: roleError } = await adminClient
// //       .from("user_roles")
// //       .insert({ user_id: newUser.user.id, role: "partner" });

// //     if (roleError) {
// //       console.error("Role error:", roleError);
// //       // Cleanup: delete the created user
// //       await adminClient.auth.admin.deleteUser(newUser.user.id);
// //       return new Response(
// //         JSON.stringify({ error: "Failed to assign partner role" }),
// //         {
// //           status: 500,
// //           headers: { ...corsHeaders, "Content-Type": "application/json" },
// //         }
// //       );
// //     }

// //     // Create profile (if not auto-created by trigger)
// //     await adminClient.from("profiles").upsert(
// //       {
// //         id: newUser.user.id,
// //         full_name: fullName,
// //       },
// //       { onConflict: "id" }
// //     );

// //     // Link partner to gym
// //     const { error: partnerError } = await adminClient
// //       .from("gym_partners")
// //       .insert({ user_id: newUser.user.id, gym_id: gymId });

// //     if (partnerError) {
// //       console.error("Partner link error:", partnerError);
// //       // Cleanup
// //       await adminClient
// //         .from("user_roles")
// //         .delete()
// //         .eq("user_id", newUser.user.id);
// //       await adminClient.auth.admin.deleteUser(newUser.user.id);
// //       return new Response(
// //         JSON.stringify({ error: "Failed to link partner to gym" }),
// //         {
// //           status: 500,
// //           headers: { ...corsHeaders, "Content-Type": "application/json" },
// //         }
// //       );
// //     }

// //     return new Response(
// //       JSON.stringify({
// //         success: true,
// //         userId: newUser.user.id,
// //         message: "Partner created successfully",
// //       }),
// //       {
// //         status: 200,
// //         headers: { ...corsHeaders, "Content-Type": "application/json" },
// //       }
// //     );
// //   } catch (error) {
// //     console.error("Unexpected error:", error);
// //     return new Response(JSON.stringify({ error: "Internal server error" }), {
// //       status: 500,
// //       headers: { ...corsHeaders, "Content-Type": "application/json" },
// //     });
// //   }
// // });
// import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

// const corsHeaders = {
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Headers":
//     "authorization, x-client-info, apikey, content-type",
// };

// Deno.serve(async (req) => {
//   // 🔹 Handle CORS preflight
//   if (req.method === "OPTIONS") {
//     return new Response(null, { headers: corsHeaders });
//   }

//   try {
//     // 🔹 ENV variables
//     const supabaseUrl = Deno.env.get("SUPABASE_URL");
//     const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

//     if (!supabaseUrl || !serviceRoleKey) {
//       return new Response(
//         JSON.stringify({ error: "Server configuration error" }),
//         { status: 500, headers: corsHeaders }
//       );
//     }

//     // 🔹 Service role client (ONLY client needed)
//     const adminClient = createClient(supabaseUrl, serviceRoleKey, {
//       auth: {
//         autoRefreshToken: false,
//         persistSession: false,
//       },
//     });

//     // 🔹 Read JWT from request
//     const authHeader = req.headers.get("Authorization");
//     if (!authHeader) {
//       return new Response(
//         JSON.stringify({ error: "Missing Authorization header" }),
//         { status: 401, headers: corsHeaders }
//       );
//     }

//     // 🔹 Validate caller using SERVICE ROLE (CORRECT WAY)
//     const {
//       data: { user: caller },
//       error: authError,
//     } = await adminClient.auth.getUser(authHeader);

//     if (authError || !caller) {
//       return new Response(JSON.stringify({ error: "Invalid JWT" }), {
//         status: 401,
//         headers: corsHeaders,
//       });
//     }

//     // 🔹 Check admin role
//     const { data: roleData } = await adminClient
//       .from("user_roles")
//       .select("role")
//       .eq("user_id", caller.id)
//       .eq("role", "admin")
//       .maybeSingle();

//     if (!roleData) {
//       return new Response(JSON.stringify({ error: "Admin access required" }), {
//         status: 403,
//         headers: corsHeaders,
//       });
//     }

//     // 🔹 Parse request body
//     const { email, password, fullName, gymId } = await req.json();

//     if (!email || !password || !fullName || !gymId) {
//       return new Response(
//         JSON.stringify({ error: "Missing required fields" }),
//         { status: 400, headers: corsHeaders }
//       );
//     }

//     // 🔹 Check if user already exists
//     const { data: users } = await adminClient.auth.admin.listUsers();
//     const existingUser = users?.users?.find((u: any) => u.email === email);

//     if (existingUser) {
//       return new Response(
//         JSON.stringify({ error: "User with this email already exists" }),
//         { status: 400, headers: corsHeaders }
//       );
//     }

//     // 🔹 Create partner user
//     const { data: newUser, error: createError } =
//       await adminClient.auth.admin.createUser({
//         email,
//         password,
//         email_confirm: true,
//         user_metadata: { full_name: fullName },
//       });

//     if (createError || !newUser.user) {
//       return new Response(
//         JSON.stringify({
//           error: createError?.message || "Failed to create user",
//         }),
//         { status: 400, headers: corsHeaders }
//       );
//     }

//     const userId = newUser.user.id;

//     // 🔹 Assign partner role
//     const { error: roleError } = await adminClient
//       .from("user_roles")
//       .insert({ user_id: userId, role: "partner" });

//     if (roleError) {
//       await adminClient.auth.admin.deleteUser(userId);
//       return new Response(
//         JSON.stringify({ error: "Failed to assign partner role" }),
//         { status: 500, headers: corsHeaders }
//       );
//     }

//     // 🔹 Upsert profile
//     await adminClient
//       .from("profiles")
//       .upsert({ id: userId, full_name: fullName }, { onConflict: "id" });

//     // 🔹 Link partner to gym
//     const { error: partnerError } = await adminClient
//       .from("gym_partners")
//       .insert({ user_id: userId, gym_id: gymId });

//     if (partnerError) {
//       await adminClient.from("user_roles").delete().eq("user_id", userId);
//       await adminClient.auth.admin.deleteUser(userId);

//       return new Response(
//         JSON.stringify({ error: "Failed to link partner to gym" }),
//         { status: 500, headers: corsHeaders }
//       );
//     }

//     // ✅ SUCCESS
//     return new Response(
//       JSON.stringify({
//         success: true,
//         userId,
//         message: "Partner created successfully",
//       }),
//       { status: 200, headers: corsHeaders }
//     );
//   } catch (error: any) {
//     return new Response(
//       JSON.stringify({ error: error.message || "Internal server error" }),
//       { status: 500, headers: corsHeaders }
//     );
//   }
// });

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    console.log("✅ CORS preflight");
    return new Response(null, { headers: corsHeaders });
  }

  console.log("========================================");
  console.log("🚀 CREATE PARTNER - START");
  console.log("========================================");

  try {
    // Log environment check
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    console.log("1️⃣ Environment Check:");
    console.log("   - SUPABASE_URL:", supabaseUrl ? "✅ Set" : "❌ Missing");
    console.log(
      "   - SERVICE_ROLE_KEY:",
      serviceRoleKey ? "✅ Set" : "❌ Missing"
    );

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("❌ Missing environment variables");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Log headers
    console.log("2️⃣ Request Headers:");
    const authHeader = req.headers.get("Authorization");
    console.log(
      "   - Authorization:",
      authHeader ? `Bearer ${authHeader.substring(7, 27)}...` : "❌ Missing"
    );
    console.log("   - Content-Type:", req.headers.get("Content-Type"));

    if (!authHeader) {
      console.error("❌ No Authorization header");
      return new Response(
        JSON.stringify({ error: "No authorization header provided" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Extract token
    const token = authHeader.replace("Bearer ", "").trim();
    console.log("3️⃣ Token extracted, length:", token.length);

    // Create Supabase client with service role
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    console.log("4️⃣ Supabase client created");

    // Verify the JWT
    console.log("5️⃣ Verifying JWT with getUser()...");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError) {
      console.error("❌ JWT verification failed:");
      console.error("   - Error name:", authError.name);
      console.error("   - Error message:", authError.message);
      console.error("   - Error status:", authError.status);

      return new Response(
        JSON.stringify({
          error: "JWT verification failed",
          details: authError.message,
          name: authError.name,
          hint: "Try logging out and back in",
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!user) {
      console.error("❌ No user returned from getUser()");
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("✅ User authenticated:");
    console.log("   - Email:", user.email);
    console.log("   - ID:", user.id);

    // Check admin role
    console.log("6️⃣ Checking admin role...");
    const { data: roleData, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError) {
      console.error("❌ Role check error:", roleError.message);
      return new Response(
        JSON.stringify({ error: "Failed to verify admin role" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!roleData) {
      console.log("❌ User is not an admin");
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("✅ Admin verified");

    // Parse body
    console.log("7️⃣ Parsing request body...");
    const body = await req.json();
    const { email, password, fullName, gymId } = body;

    console.log("   - Email:", email);
    console.log("   - Full Name:", fullName);
    console.log("   - Gym ID:", gymId);

    if (!email || !password || !fullName || !gymId) {
      console.error("❌ Missing required fields");
      return new Response(
        JSON.stringify({
          error: "Missing required fields",
          received: {
            email: !!email,
            password: !!password,
            fullName: !!fullName,
            gymId: !!gymId,
          },
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (password.length < 6) {
      console.error("❌ Password too short");
      return new Response(
        JSON.stringify({ error: "Password must be at least 6 characters" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check gym exists
    console.log("8️⃣ Checking if gym exists...");
    const { data: gym, error: gymError } = await supabase
      .from("gyms")
      .select("id, name")
      .eq("id", gymId)
      .single();

    if (gymError || !gym) {
      console.error("❌ Gym not found:", gymError?.message);
      return new Response(JSON.stringify({ error: "Gym not found" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("✅ Gym found:", gym.name);

    // Check if user exists
    console.log("9️⃣ Checking if user with email exists...");
    const { data: users } = await supabase.auth.admin.listUsers();
    const userExists = users?.users?.some((u) => u.email === email);

    if (userExists) {
      console.error("❌ User already exists");
      return new Response(
        JSON.stringify({ error: "User with this email already exists" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("✅ Email available");

    // Create user
    console.log("🔟 Creating user...");
    const { data: newUser, error: createError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName },
      });

    if (createError || !newUser.user) {
      console.error("❌ User creation failed:", createError?.message);
      return new Response(
        JSON.stringify({
          error: createError?.message || "Failed to create user",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const newUserId = newUser.user.id;
    console.log("✅ User created:", newUserId);

    try {
      // Add role
      console.log("1️⃣1️⃣ Adding partner role...");
      const { error: roleError2 } = await supabase
        .from("user_roles")
        .insert({ user_id: newUserId, role: "partner" });

      if (roleError2) throw roleError2;
      console.log("✅ Role added");

      // Create profile
      console.log("1️⃣2️⃣ Creating profile...");
      await supabase
        .from("profiles")
        .upsert({ id: newUserId, full_name: fullName }, { onConflict: "id" });
      console.log("✅ Profile created");

      // Link to gym
      console.log("1️⃣3️⃣ Linking to gym...");
      const { error: linkError } = await supabase
        .from("gym_partners")
        .insert({ user_id: newUserId, gym_id: gymId });

      if (linkError) throw linkError;
      console.log("✅ Linked to gym");

      console.log("========================================");
      console.log("🎉 SUCCESS - Partner created!");
      console.log("========================================");

      return new Response(
        JSON.stringify({
          success: true,
          userId: newUserId,
          message: "Partner created successfully",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } catch (cleanupError: any) {
      console.error("❌ Setup failed, cleaning up...");
      console.error("   Error:", cleanupError.message);

      await supabase.from("gym_partners").delete().eq("user_id", newUserId);
      await supabase.from("user_roles").delete().eq("user_id", newUserId);
      await supabase.auth.admin.deleteUser(newUserId);

      return new Response(
        JSON.stringify({
          error: "Failed to setup partner: " + cleanupError.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  } catch (error: any) {
    console.error("========================================");
    console.error("💥 UNEXPECTED ERROR");
    console.error("========================================");
    console.error("Error:", error.message);
    console.error("Stack:", error.stack);

    return new Response(
      JSON.stringify({
        error: error.message || "Internal server error",
        type: error.name,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
