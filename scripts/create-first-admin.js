/**
 * Script to create the first admin user
 * Run with: node scripts/create-first-admin.js
 * 
 * This script helps you create your first super admin user.
 * Make sure to set your environment variables first.
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const bcrypt = require('bcryptjs')
const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve))
}

async function main() {
  console.log('Create First Admin User')
  console.log('=======================\n')

  // Check environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.error('Error: NEXT_PUBLIC_SUPABASE_URL is not set in .env.local')
    process.exit(1)
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('Error: NEXT_PUBLIC_SUPABASE_ANON_KEY is not set in .env.local')
    process.exit(1)
  }

  // Get user input
  const email = await question('Email: ')
  const password = await question('Password: ')
  const name = await question('Name: ')
  const roleInput = await question('Role (super_admin/event_admin) [super_admin]: ')
  const role = (roleInput || 'super_admin').trim()

  if (role !== 'super_admin' && role !== 'event_admin') {
    console.error('Error: Role must be either "super_admin" or "event_admin"')
    rl.close()
    process.exit(1)
  }

  console.log('\nCreating admin...')

  try {
    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Insert admin
    const { data: admin, error } = await supabase
      .from('admins')
      .insert({
        email: email.trim(),
        password_hash: passwordHash,
        name: name.trim(),
        role: role,
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        console.error('\n❌ Error: An admin with this email already exists')
      } else {
        console.error('\n❌ Error:', error.message)
      }
      rl.close()
      process.exit(1)
    }

    // Remove password_hash from output
    const { password_hash: _, ...adminWithoutPassword } = admin

    console.log('\n✅ Admin created successfully!')
    console.log('Admin Details:')
    console.log('  ID:', adminWithoutPassword.id)
    console.log('  Email:', adminWithoutPassword.email)
    console.log('  Name:', adminWithoutPassword.name)
    console.log('  Role:', adminWithoutPassword.role)
    console.log('\nYou can now login at http://localhost:3000/login')
  } catch (error) {
    console.error('\n❌ Error:', error.message)
    process.exit(1)
  } finally {
    rl.close()
  }
}

main().catch((error) => {
  console.error('Unexpected error:', error)
  process.exit(1)
})

