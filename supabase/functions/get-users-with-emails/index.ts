import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get profiles
    const { data: profiles, error: profilesError } = await supabaseClient
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (profilesError) throw profilesError

    // Get couples data
    const { data: couples, error: couplesError } = await supabaseClient
      .from('couples')
      .select('*')

    if (couplesError) throw couplesError

    // Get auth users data
    const { data: authData, error: authError } = await supabaseClient.auth.admin.listUsers()

    if (authError) throw authError

    // Combine the data
    const usersWithAuth = profiles?.map(profile => {
      const authUser = authData?.users?.find((user: any) => user.id === profile.id)
      const couple = couples?.find((c: any) => 
        c.user1_id === profile.id || c.user2_id === profile.id
      )
      
      return {
        ...profile,
        email: authUser?.email || 'N/A',
        couple_id: couple?.id || null,
        partner_id: couple?.user1_id === profile.id ? couple?.user2_id : couple?.user1_id || null,
        couple_status: couple?.status || null
      }
    }) || []

    return new Response(
      JSON.stringify({ users: usersWithAuth }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})