import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title="Lupa Password" />

            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-800 text-center">Lupa Password Anda?</h2>
                <p className="mt-2 text-sm text-gray-600 text-center">
                    Masukkan alamat email akun Anda. Kami akan mengirimkan tautan (link) reset password untuk membuat password baru.
                </p>
            </div>

            {status && (
                <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-sm font-semibold text-green-700 text-center">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Alamat Email <span className="text-red-500">*</span>
                    </label>
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="w-full rounded-lg border-gray-200 focus:ring-indigo-500 text-sm"
                        isFocused={true}
                        placeholder="contoh: user@priskila.co.id"
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    <InputError message={errors.email} className="mt-1.5" />
                </div>

                <div className="pt-2 flex flex-col gap-3">
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-lg transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center"
                    >
                        {processing ? 'Mengirim Link Reset...' : 'Kirim Link Reset Password'}
                    </button>

                    <Link
                        href={route('login')}
                        className="text-center text-xs font-semibold text-gray-500 hover:text-indigo-600 transition-colors"
                    >
                        &larr; Kembali ke Halaman Login
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
