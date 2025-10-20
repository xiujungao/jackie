'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import postgres from 'postgres';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: 'Please select a customer.',
  }),
  amount: z.coerce
            .number()
            .gt(0, { message: 'Please enter an amount greater than $0.' }),
  status: z.enum(['pending', 'paid'],{
    invalid_type_error: 'Please select an invoice status.',
  }),
  date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
  fields?: {
    customerId?: string;
    amount?: string;
    status?: 'pending' | 'paid';
  };
};

export async function createInvoice(prevState: State, formData: FormData) : Promise<State> {
  /*
  // Prepare data for insertion into the database
  const { customerId, amount, status } = CreateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
  */

  const customerId = formData.get('customerId') ?.toString() ?? null;
  const amount     = (formData.get('amount') ?? '').toString();
  const status     = (formData.get('status') ?. toString() as 'pending' | 'paid') ?? null;
  console.log('Form Data:', { customerId, amount, status });

  // Validate form fields using Zod
  const validatedFields = CreateInvoice.safeParse({
    customerId,
    amount,
    status,
  });
  console.log('Validated Fields:', validatedFields);

  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    console.log('customerId in state fields:', customerId ?? '');
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
      fields: {
        customerId: customerId ?? '',
        amount,
        status,
      },
    };
  }

  const amountInCents = Number(amount) * 100;
  const date = new Date().toISOString().split('T')[0];

  try {
    await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
  } catch (error) {
    console.error('Error creating invoice:', error);
    return {
      message: 'Database Error: Failed to Create Invoice.',
      fields: {
        customerId: customerId ?? '',
        amount,
        status,
      },
    };
  }
  
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function updateInvoice(id: string, prevState: State, formData: FormData) : Promise<State> {
  /*
  // Prepare data for updating the database
  const { customerId, amount, status } = UpdateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
  */

  const customerId = formData.get('customerId') ?.toString() ?? null;
  const amount     = (formData.get('amount') ?? '').toString();
  const status     = (formData.get('status') ?. toString() as 'pending' | 'paid') ?? null;

  // Validate form fields using Zod
  const validatedFields = UpdateInvoice.safeParse({
    customerId,
    amount,
    status,
  });
  console.log('Validated Fields:', validatedFields);

  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
      fields: {
        customerId: customerId ?? '',
        amount,
        status,
      },
    };
  }

  console.log('Updating invoice with data:', { id, customerId, amount, status });
 
  const amountInCents = Number(amount) * 100;
 
  try {
    await sql`
      UPDATE invoices
      SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
      WHERE id = ${id}
    `;
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return {
      message: 'Database Error: Failed to Update Invoice.',
      fields: {
        customerId: customerId ?? '',
        amount,
        status,
      },
    };
  }
  
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) : Promise<void> {
//  throw new Error('Failed to Delete Invoice'); // Simulate an error for testing

  await sql`DELETE FROM invoices WHERE id = ${id}`;
  revalidatePath('/dashboard/invoices');
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}