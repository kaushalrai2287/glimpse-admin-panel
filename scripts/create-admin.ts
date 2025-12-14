/**
 * Script to create an admin user
 * Run with: npx ts-node scripts/create-admin.ts
 */

import { createAdmin } from '../lib/auth'
import readline from 'readline'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

function question(query: string): Promise<string> {
  return new Promise((resolve) => rl.question(query, resolve))
}

async function main() {
  console.log('Create Admin User')
  console.log('=================\n')

  const email = await question('Email: ')
  const password = await question('Password: ')
  const name = await question('Name: ')
  const roleInput = await question('Role (super_admin/event_admin) [event_admin]: ')
  const role = (roleInput || 'event_admin') as 'super_admin' | 'event_admin'

  console.log('\nCreating admin...')

  const admin = await createAdmin(email, password, name, role)

  if (admin) {
    console.log('\n✅ Admin created successfully!')
    console.log(`ID: ${admin.id}`)
    console.log(`Email: ${admin.email}`)
    console.log(`Name: ${admin.name}`)
    console.log(`Role: ${admin.role}`)
  } else {
    console.log('\n❌ Failed to create admin')
  }

  rl.close()
}

main().catch(console.error)

