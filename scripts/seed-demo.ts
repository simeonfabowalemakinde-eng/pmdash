#!/usr/bin/env ts-node
/**
 * Seed demo data for a specific tester user
 * Usage: NEXT_PUBLIC_SUPABASE_URL=... NEXT_PUBLIC_SUPABASE_ANON_KEY=... SUPABASE_SERVICE_ROLE_KEY=... npx ts-node scripts/seed-demo.ts --email=test@example.com
 */

import { getServiceRoleClient } from '../src/lib/supabase'

const DEMO_INITIATIVES = [
  {
    name: 'Q2 Mobile Redesign',
    summary: 'Complete redesign of mobile experience for better engagement',
    status: 'active',
    target_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  },
  {
    name: 'API v3 Rollout',
    summary: 'Launch new API version with improved performance and reliability',
    status: 'active',
    target_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  },
  {
    name: 'Customer Dashboard Analytics',
    summary: 'Add real-time analytics to customer dashboard',
    status: 'planning',
    target_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  },
  {
    name: 'Infrastructure Cost Optimization',
    summary: 'Reduce cloud spend by 30% through infrastructure optimization',
    status: 'on_hold',
    target_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  },
  {
    name: 'Developer Portal Launch',
    summary: 'New self-service portal for developer onboarding',
    status: 'planning',
    target_date: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  },
]

const DEMO_WORK_ITEMS = [
  { title: 'Design mobile mockups', description: 'Create high-fidelity designs', status: 'completed', priority: 'high', source: 'roadmap', due_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], initiative_index: 0 },
  { title: 'Implement responsive navigation', description: 'Mobile-first navigation component', status: 'in_progress', priority: 'high', source: 'roadmap', due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], initiative_index: 0 },
  { title: 'A/B test new design', description: 'Run 2-week A/B test with users', status: 'backlog', priority: 'medium', source: 'roadmap', due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], initiative_index: 0 },
  { title: 'Optimize database queries', description: 'Reduce query latency by 40%', status: 'blocked', priority: 'critical', source: 'technical_debt', due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], initiative_index: 1 },
  { title: 'Add API documentation', description: 'Complete OpenAPI specs and examples', status: 'in_progress', priority: 'high', source: 'roadmap', due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], initiative_index: 1 },
  { title: 'Performance benchmarking', description: 'Benchmark v3 against v2', status: 'completed', priority: 'high', source: 'roadmap', due_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], initiative_index: 1 },
  { title: 'Rollout to beta users', description: 'Deploy to 10% of users', status: 'backlog', priority: 'high', source: 'roadmap', due_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], initiative_index: 1 },
  { title: 'Plan analytics architecture', description: 'Design real-time analytics pipeline', status: 'in_progress', priority: 'medium', source: 'planning', due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], initiative_index: 2 },
  { title: 'Choose analytics vendor', description: 'Evaluate Segment, Mixpanel, Amplitude', status: 'in_progress', priority: 'medium', source: 'planning', due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], initiative_index: 2 },
  { title: 'Infrastructure audit', description: 'Identify cost optimization opportunities', status: 'blocked', priority: 'high', source: 'planning', due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], initiative_index: 3 },
  { title: 'Reserve consolidation', description: 'Purchase 3-year reserved instances', status: 'backlog', priority: 'medium', source: 'planning', due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], initiative_index: 3 },
  { title: 'Build auth integration', description: 'OAuth 2.0 integration with auth0', status: 'in_progress', priority: 'high', source: 'roadmap', due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], initiative_index: 4 },
  { title: 'Create developer SDK', description: 'Python, Node.js, Go SDKs', status: 'backlog', priority: 'medium', source: 'roadmap', due_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], initiative_index: 4 },
  { title: 'Write API tutorials', description: 'Blog posts and video tutorials', status: 'backlog', priority: 'low', source: 'marketing', due_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], initiative_index: 4 },
  { title: 'Prepare launch announcement', description: 'Draft press release and blog post', status: 'planning', priority: 'medium', source: 'marketing', due_date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], initiative_index: 4 },
  { title: 'Setup analytics tracking', description: 'Configure event tracking in portal', status: 'backlog', priority: 'low', source: 'analytics', due_date: null, initiative_index: 4 },
  { title: 'Customer feedback interviews', description: 'Interview 5 key customers about mobile redesign', status: 'completed', priority: 'high', source: 'customer', due_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], initiative_index: 0 },
  { title: 'Stakeholder alignment meeting', description: 'Sync with exec team on API v3 rollout', status: 'completed', priority: 'high', source: 'meeting', due_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], initiative_index: 1 },
]

const DEMO_NOTES = [
  {
    title: 'Mobile Redesign Decision',
    body: 'After customer feedback, we decided to redesign the entire mobile experience. Key decisions: React Native for cross-platform, dark mode by default, bottom navigation instead of top.',
    note_type: 'decision',
    include_in_ai_summary: true,
    source: 'meeting',
    initiative_index: 0,
  },
  {
    title: 'Database Performance Blocker',
    body: 'API v3 hitting query latency issues in staging. Root cause: N+1 queries in dashboard endpoint. Blocking rollout until resolved.',
    note_type: 'blocker',
    include_in_ai_summary: true,
    source: 'slack',
    initiative_index: 1,
  },
  {
    title: 'Customer Feedback - Mobile',
    body: 'Interview with Acme Corp: Navigation is confusing, dark mode is nice, but onboarding flow needs simplification. 4 out of 5 customers mentioned this.',
    note_type: 'stakeholder',
    include_in_ai_summary: true,
    source: 'customer_call',
    initiative_index: 0,
  },
  {
    title: 'API v3 Architecture Review',
    body: 'Completed architecture review with team. Approved design. Concerns: backward compatibility testing needs more time. Decision: add 1 week for integration tests.',
    note_type: 'decision',
    include_in_ai_summary: true,
    source: 'meeting',
    initiative_index: 1,
  },
  {
    title: 'Infrastructure Cost Analysis',
    body: 'Audit shows 40% of spend is on unused capacity. Major opportunity: database right-sizing. Estimated savings: $15k/month.',
    note_type: 'lesson_learned',
    include_in_ai_summary: false,
    source: 'analysis',
    initiative_index: 3,
  },
  {
    title: 'Analytics Platform Evaluation',
    body: 'Comparing Segment vs Mixpanel vs Amplitude. Segment has better integrations, Mixpanel cheaper, Amplitude best for mobile. Leaning toward Segment.',
    note_type: 'process',
    include_in_ai_summary: false,
    source: 'research',
    initiative_index: 2,
  },
  {
    title: 'Developer Portal MVP Scope',
    body: 'MVP scope approved: Auth via OAuth, API key management, basic docs. Phase 2: SDKs, community, billing. Target launch: Aug.',
    note_type: 'decision',
    include_in_ai_summary: true,
    source: 'meeting',
    initiative_index: 4,
  },
  {
    title: 'Risk: Scope Creep on Mobile',
    body: 'Multiple requests for new features during mobile redesign. Decision: Only critical bug fixes until redesign ships. New features go to backlog.',
    note_type: 'blocker',
    include_in_ai_summary: true,
    source: 'meeting',
    initiative_index: 0,
  },
  {
    title: 'Process: How We Review PRs',
    body: 'Established new PR review process: 2 approvals required, at least one from tech lead. All PRs must have tests. Reduces bugs by ~30%.',
    note_type: 'process',
    include_in_ai_summary: false,
    source: 'documentation',
    initiative_index: null,
  },
  {
    title: 'Lesson: Importance of Beta Testing',
    body: 'API v2 had issues in production that beta testing would have caught. Learning: Always run 2-week beta with 10% of users before full rollout.',
    note_type: 'lesson_learned',
    include_in_ai_summary: true,
    source: 'retrospective',
    initiative_index: 1,
  },
  {
    title: 'Customer Success: Mobile Redesign Feedback',
    body: 'Early feedback from beta users: 92% satisfaction with new design, 15% improvement in onboarding completion rate.',
    note_type: 'stakeholder',
    include_in_ai_summary: true,
    source: 'metrics',
    initiative_index: 0,
  },
  {
    title: 'Meeting: Weekly Ops Sync',
    body: 'Topics covered: Mobile redesign on track, API v3 database issue escalated, developer portal moving to planning phase. All initiatives within budget.',
    note_type: 'meeting',
    include_in_ai_summary: true,
    source: 'meeting',
    initiative_index: null,
  },
]

async function seedDemo(email: string) {
  const client = getServiceRoleClient()

  try {
    // 1. Find user by email
    console.log(`Looking up user with email: ${email}`)
    const { data: userData, error: userError } = await client
      .from('auth.users')
      .select('id')
      .eq('email', email)
      .single()

    if (userError || !userData) {
      console.error(`User not found: ${email}`)
      process.exit(1)
    }

    const userId = userData.id
    console.log(`Found user: ${userId}`)

    // 2. Create AI allowance if not exists
    console.log('Creating AI allowance...')
    await client
      .from('user_ai_allowance')
      .upsert({
        user_id: userId,
        total_allowance: 50,
        used: 0,
      })

    // 3. Create initiatives
    console.log('Creating initiatives...')
    const { data: initiatives, error: initiativesError } = await client
      .from('initiatives')
      .insert(
        DEMO_INITIATIVES.map(init => ({
          ...init,
          user_id: userId,
          external_key: null,
        }))
      )
      .select()

    if (initiativesError) throw initiativesError
    console.log(`Created ${initiatives?.length || 0} initiatives`)

    // 4. Create work items
    console.log('Creating work items...')
    const workItemsToCreate = DEMO_WORK_ITEMS.map(item => {
      const initId = initiatives?.[item.initiative_index]?.id
      return {
        ...item,
        initiative_id: initId,
        user_id: userId,
        external_key: null,
      }
    })

    const { data: workItems, error: workItemsError } = await client
      .from('work_items')
      .insert(workItemsToCreate)
      .select()

    if (workItemsError) throw workItemsError
    console.log(`Created ${workItems?.length || 0} work items`)

    // 5. Create notes
    console.log('Creating notes...')
    const notesToCreate = DEMO_NOTES.map(note => ({
      ...note,
      user_id: userId,
      initiative_id: note.initiative_index !== null ? initiatives?.[note.initiative_index]?.id : null,
      work_item_id: null,
    }))

    const { data: notes, error: notesError } = await client
      .from('notes')
      .insert(notesToCreate)
      .select()

    if (notesError) throw notesError
    console.log(`Created ${notes?.length || 0} notes`)

    console.log('✓ Demo data seeded successfully!')
  } catch (error: any) {
    console.error('Seeding failed:', error.message)
    process.exit(1)
  }
}

const args = process.argv.slice(2)
const emailArg = args.find(arg => arg.startsWith('--email='))
if (!emailArg) {
  console.error('Usage: npx ts-node scripts/seed-demo.ts --email=tester@example.com')
  process.exit(1)
}

const email = emailArg.split('=')[1]
seedDemo(email)
