<template>

    <Head>
        <Title>Login - {{ runtimeConfig?.public?.appName }}</Title>
    </Head>

    <main class="login-page">
        <!-- Brand / Product panel -->
        <section class="brand-panel">
            <div class="brand-glow brand-glow--top"></div>
            <div class="brand-glow brand-glow--bottom"></div>

            <div class="brand-header">
                <div class="brand">
                    <div class="brand-mark">
                        <svg viewBox="0 0 40 40" width="40" height="40" aria-hidden="true">
                            <circle cx="20" cy="20" r="19" fill="#173A59" stroke="#42AED9" stroke-width="1" />
                            <circle cx="20" cy="20" r="12" fill="#42AED9" stroke="#ffffff" stroke-width="0.75" />
                            <circle cx="20" cy="20" r="4" fill="#ffffff" fill-opacity="0.9" />
                        </svg>
                    </div>

                    <div>
                        <div class="brand-name">
                            {{ runtimeConfig?.public?.appName || 'POS' }}
                        </div>
                        <div class="brand-label">
                            Point of Sale
                        </div>
                    </div>
                </div>
            </div>

            <div class="brand-content">
                <div class="eyebrow">
                    Welcome back
                </div>

                <h1>
                    Your workspace is
                    <span>ready when you are.</span>
                </h1>

                <p>
                    Sign in to manage transactions, monitor operations,
                    and continue your work securely.
                </p>

                <div class="feature-list">
                    <div class="feature-item">
                        <div class="feature-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M20 6 9 17l-5-5" />
                            </svg>
                        </div>

                        <div>
                            <strong>Fast and simple</strong>
                            <span>Get straight back to your workspace.</span>
                        </div>
                    </div>

                    <div class="feature-item">
                        <div class="feature-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                        </div>

                        <div>
                            <strong>Secure access</strong>
                            <span>Your account and operational data stay protected.</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="brand-footer">
                <div class="status">
                    <span class="status-dot"></span>
                    <span>System operational</span>
                </div>

                <span>
                    © {{ new Date().getFullYear() }}
                    {{ runtimeConfig?.public?.appName || 'POS' }}
                </span>
            </div>
        </section>

        <!-- Login panel -->
        <section class="login-panel">
            <div class="mobile-brand">
                <div class="brand-mark brand-mark--small">
                    <svg viewBox="0 0 40 40" width="34" height="34" aria-hidden="true">
                        <circle cx="20" cy="20" r="19" fill="#173A59" stroke="#42AED9" stroke-width="1" />
                        <circle cx="20" cy="20" r="12" fill="#42AED9" />
                    </svg>
                </div>

                <span>
                    {{ runtimeConfig?.public?.appName || 'POS' }}
                </span>
            </div>

            <form class="login-card" @submit.prevent="login">
                <header class="form-header">
                    <div class="form-eyebrow">
                        Account access
                    </div>

                    <h2>
                        Welcome back
                    </h2>

                    <p>
                        Enter your credentials to access your account.
                    </p>
                </header>

                <Alert v-if="
                    state.error?.message &&
                    state.error.message.length > 0
                " type="danger" :text="state.error.message" class="alert" />

                <div class="field">
                    <label for="co-email">
                        Email address
                    </label>

                    <div class="input-wrap">
                        <div class="input-icon">
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                <rect width="20" height="16" x="2" y="4" rx="2" />
                                <path d="m22 7-10 7L2 7" />
                            </svg>
                        </div>

                        <input id="co-email" v-model="state.formLogin.email" type="email" placeholder="you@example.com"
                            autocomplete="email" inputmode="email" :disabled="state.isPageLoading" />
                    </div>

                    <FormError :error="v$?.formLogin?.email
                        ?.$errors[0]?.$message
                        ?.toString()
                        " />

                    <FormError :error="state?.error?.errors?.email?.[0]" />
                </div>

                <div class="field">
                    <div class="label-row">
                        <label for="co-pw">
                            Password
                        </label>
                    </div>

                    <div class="input-wrap">
                        <div class="input-icon">
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                        </div>

                        <input id="co-pw" v-model="state.formLogin.password" :type="state.showPassword
                            ? 'text'
                            : 'password'
                            " placeholder="Enter your password" autocomplete="current-password"
                            :disabled="state.isPageLoading" />

                        <button class="password-toggle" type="button" :aria-label="state.showPassword
                            ? 'Hide password'
                            : 'Show password'
                            " :aria-pressed="state.showPassword" @click="
                                state.showPassword =
                                !state.showPassword
                                ">
                            <!-- Eye off -->
                            <svg v-if="state.showPassword" width="18" height="18" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                                aria-hidden="true">
                                <path d="m2 2 20 20" />
                                <path d="M6.71 6.71C3.78 8.27 2 12 2 12s3.5 7 10 7c1.58 0 2.96-.41 4.15-1.02" />
                                <path d="M10.73 5.08A9.4 9.4 0 0 1 12 5c6.5 0 10 7 10 7a17.7 17.7 0 0 1-2.1 3.19" />
                            </svg>

                            <!-- Eye -->
                            <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                <path
                                    d="M2.06 12.35C3.5 8.17 7.39 5 12 5s8.5 3.17 9.94 7.35a1 1 0 0 1 0 .65C20.5 17.17 16.61 20 12 20S3.5 17.17 2.06 13a1 1 0 0 1 0-.65Z" />
                                <circle cx="12" cy="12.5" r="3" />
                            </svg>
                        </button>
                    </div>

                    <FormError :error="v$?.formLogin?.password
                        ?.$errors[0]?.$message
                        ?.toString()
                        " />

                    <FormError :error="state?.error?.errors?.password?.[0]
                        " />
                </div>

                <button class="submit-button" type="submit" :disabled="state.isPageLoading">
                    <span v-if="state.isPageLoading" class="spinner" aria-hidden="true"></span>

                    <span>
                        {{
                            state.isPageLoading
                                ? 'Signing in...'
                                : 'Sign in'
                        }}
                    </span>

                    <svg v-if="!state.isPageLoading" width="18" height="18" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                        aria-hidden="true">
                        <path d="M5 12h14" />
                        <path d="m13 6 6 6-6 6" />
                    </svg>
                </button>

                <div class="security-note">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                        stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <path d="M20 13c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V5l8-3 8 3v8Z" />
                        <path d="m9 12 2 2 4-4" />
                    </svg>

                    <span>
                        Secure encrypted connection
                    </span>
                </div>
            </form>
        </section>
    </main>
</template>

<script setup lang="ts">
import { authService } from '@/components/api/user/AuthService'
import { useVuelidate } from '@vuelidate/core'
import { required, helpers } from '@vuelidate/validators'
import { useUserStore } from '@/store/user'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const userStore = useUserStore()

const state = reactive({
    error: {} as Error,
    formLogin: {
        email: null as string | null,
        password: null as string | null,
    },
    isPageLoading: false,
    showPassword: false,
})

const rules = computed(() => ({
    formLogin: {
        email: {
            required: helpers.withMessage(
                () => 'This field is required.',
                required
            ),
        },
        password: {
            required: helpers.withMessage(
                () => 'This field is required.',
                required
            ),
        },
    },
}))

const v$ = useVuelidate(rules, state)

async function login() {
    state.error = {}
    await v$.value.$validate()

    if (v$.value.$error) {
        return
    }

    state.isPageLoading = true

    try {
        const params = {
            email: state.formLogin.email,
            password: state.formLogin.password,
        }

        const response = await authService.login(params)

        if (response.data) {
            localStorage.setItem("_token", response.data?.token)
            userStore.setUser(response?.data?.user)
            await navigateTo('/dashboard')
        }
    } catch (error: any) {
        state.error = error
    } finally {
        state.isPageLoading = false
    }
}
</script>

<style>
* {
    box-sizing: border-box;
}

html,
body,
#__nuxt {
    min-height: 100%;
}

body {
    margin: 0;
}

button,
input {
    font: inherit;
}

/* ==========================================================
   PAGE
   ========================================================== */

.login-page {
    --brand: #42aed9;
    --brand-dark: #1b7395;
    --navy: #102c46;
    --navy-deep: #091e31;
    --text: #16283a;
    --muted: #708090;
    --border: #dbe5ec;
    --surface: #ffffff;
    --background: #f4f8fb;

    min-height: 100vh;
    display: grid;
    grid-template-columns:
        minmax(400px, 0.9fr) minmax(520px, 1.25fr);

    font-family:
        Inter,
        -apple-system,
        BlinkMacSystemFont,
        'Segoe UI',
        sans-serif;

    background: var(--background);
    color: var(--text);
}

/* ==========================================================
   LEFT PANEL
   ========================================================== */

.brand-panel {
    position: relative;
    isolation: isolate;
    overflow: hidden;

    min-height: 100vh;
    padding: 42px 48px 38px;

    display: flex;
    flex-direction: column;

    color: #fff;

    background:
        linear-gradient(145deg,
            #0b253c 0%,
            #123b5c 48%,
            #092239 100%);
}

.brand-panel::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -2;

    background-image:
        linear-gradient(rgba(255, 255, 255, 0.025) 1px,
            transparent 1px),
        linear-gradient(90deg,
            rgba(255, 255, 255, 0.025) 1px,
            transparent 1px);

    background-size: 42px 42px;

    mask-image:
        linear-gradient(to bottom,
            rgba(0, 0, 0, 0.75),
            transparent 80%);
}

.brand-glow {
    position: absolute;
    z-index: -1;
    border-radius: 50%;
    filter: blur(4px);
    pointer-events: none;
}

.brand-glow--top {
    width: 440px;
    height: 440px;
    top: -220px;
    right: -180px;

    background:
        radial-gradient(circle,
            rgba(66, 174, 217, 0.25),
            transparent 68%);
}

.brand-glow--bottom {
    width: 420px;
    height: 420px;
    left: -220px;
    bottom: -180px;

    background:
        radial-gradient(circle,
            rgba(58, 195, 184, 0.12),
            transparent 70%);
}

.brand-header {
    position: relative;
    z-index: 1;
}

.brand {
    display: inline-flex;
    align-items: center;
    gap: 14px;
}

.brand-mark {
    width: 46px;
    height: 46px;

    display: grid;
    place-items: center;

    filter:
        drop-shadow(0 8px 18px rgba(0, 0, 0, 0.14));
}

.brand-name {
    font-size: 17px;
    font-weight: 700;
    line-height: 1.15;
    letter-spacing: -0.25px;
}

.brand-label {
    margin-top: 3px;

    color: rgba(255, 255, 255, 0.42);

    font-size: 10px;
    font-weight: 600;
    letter-spacing: 1.2px;
    text-transform: uppercase;
}

.brand-content {
    position: relative;
    z-index: 1;

    margin: auto 0;
    max-width: 470px;
    padding: 80px 0;
}

.eyebrow,
.form-eyebrow {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1.4px;
    text-transform: uppercase;
}

.eyebrow {
    margin-bottom: 20px;
    color: #67c8eb;
}

.brand-content h1 {
    margin: 0;

    max-width: 440px;

    color: #ffffff;
    font-size: clamp(38px, 4vw, 45px);
    font-weight: 700;
    line-height: 1.08;
    letter-spacing: -2px;
}

.brand-content h1 span {
    display: block;
    color: #76cbed;
    font-size: clamp(38px, 4vw, 45px);
}

.brand-content>p {
    margin: 22px 0 0;

    max-width: 400px;

    color: rgba(255, 255, 255, 0.58);
    font-size: 14px;
    line-height: 1.8;
}

.feature-list {
    margin-top: 38px;

    display: flex;
    flex-direction: column;
    gap: 20px;
}

.feature-item {
    display: flex;
    align-items: center;
    gap: 13px;
}

.feature-icon {
    flex: 0 0 auto;

    width: 34px;
    height: 34px;

    display: grid;
    place-items: center;

    border: 1px solid rgba(93, 193, 232, 0.24);
    border-radius: 9px;

    color: #6ec8ea;
    background: rgba(66, 174, 217, 0.08);
}

.feature-item>div:last-child {
    display: flex;
    flex-direction: column;
    gap: 3px;
}

.feature-item strong {
    font-size: 12px;
    font-weight: 600;
}

.feature-item span {
    color: rgba(255, 255, 255, 0.42);
    font-size: 11px;
    line-height: 1.45;
}

.brand-footer {
    position: relative;
    z-index: 1;

    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;

    color: rgba(255, 255, 255, 0.3);
    font-size: 10px;
}

.status {
    display: inline-flex;
    align-items: center;
    gap: 7px;
}

.status-dot {
    width: 6px;
    height: 6px;

    border-radius: 50%;

    background: #57d19b;
    box-shadow:
        0 0 0 4px rgba(87, 209, 155, 0.08);
}

/* ==========================================================
   RIGHT PANEL
   ========================================================== */

.login-panel {
    position: relative;

    min-width: 0;
    min-height: 100vh;
    padding: 48px;

    display: flex;
    align-items: center;
    justify-content: center;

    background:
        radial-gradient(circle at 85% 10%,
            rgba(66, 174, 217, 0.09),
            transparent 26%),
        radial-gradient(circle at 10% 90%,
            rgba(43, 179, 171, 0.06),
            transparent 28%),
        #f4f8fb;
}

.mobile-brand {
    display: none;
}

.login-card {
    width: 100%;
    max-width: 430px;

    padding: 38px;

    border: 1px solid rgba(21, 63, 91, 0.09);
    border-radius: 18px;

    background:
        rgba(255, 255, 255, 0.96);

    box-shadow:
        0 22px 55px rgba(15, 43, 70, 0.08),
        0 3px 10px rgba(15, 43, 70, 0.025);
}

.form-header {
    margin-bottom: 28px;
}

.form-eyebrow {
    margin-bottom: 10px;
    color: var(--brand-dark);
}

.form-header h2 {
    margin: 0;

    color: var(--navy);
    font-size: 28px;
    font-weight: 700;
    letter-spacing: -0.9px;
}

.form-header p {
    margin: 8px 0 0;

    color: var(--muted);
    font-size: 13px;
    line-height: 1.6;
}

.alert {
    margin-bottom: 22px;
}

/* ==========================================================
   FORM
   ========================================================== */

.field {
    margin-bottom: 19px;
}

.field label {
    display: block;

    margin-bottom: 7px;

    color: #28465d;
    font-size: 12px;
    font-weight: 600;
}

.label-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.input-wrap {
    position: relative;
}

.input-icon {
    position: absolute;
    z-index: 1;
    top: 50%;
    left: 14px;

    display: flex;

    color: #8ca0af;

    transform: translateY(-50%);

    pointer-events: none;
}

.input-wrap input {
    width: 100%;
    height: 48px;

    padding: 0 45px 0 43px;

    border: 1px solid var(--border);
    border-radius: 9px;

    outline: none;

    color: #173047;
    background: #fbfcfd;

    font-size: 13px;

    transition:
        border-color 160ms ease,
        box-shadow 160ms ease,
        background 160ms ease;
}

.input-wrap input::placeholder {
    color: #a8b6c1;
}

.input-wrap input:hover:not(:disabled) {
    border-color: #c3d2dc;
}

.input-wrap input:focus {
    border-color: var(--brand);
    background: #ffffff;

    box-shadow:
        0 0 0 3px rgba(66, 174, 217, 0.12);
}

.input-wrap input:disabled {
    cursor: not-allowed;
    opacity: 0.65;
}

.input-wrap:focus-within .input-icon {
    color: var(--brand-dark);
}

.password-toggle {
    position: absolute;
    top: 50%;
    right: 11px;

    width: 32px;
    height: 32px;

    display: grid;
    place-items: center;

    padding: 0;
    border: 0;
    border-radius: 7px;

    color: #788d9d;
    background: transparent;

    cursor: pointer;

    transform: translateY(-50%);

    transition:
        color 150ms ease,
        background 150ms ease;
}

.password-toggle:hover {
    color: var(--brand-dark);
    background: #edf7fb;
}

.password-toggle:focus-visible {
    outline: 2px solid var(--brand);
    outline-offset: 1px;
}

/* ==========================================================
   SUBMIT
   ========================================================== */

.submit-button {
    width: 100%;
    height: 48px;

    margin-top: 5px;

    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;

    border: 0;
    border-radius: 9px;

    color: #fff;

    background:
        linear-gradient(135deg,
            #42aed9 0%,
            #268eb8 100%);

    box-shadow:
        0 8px 18px rgba(42, 153, 196, 0.18);

    font-size: 13px;
    font-weight: 600;

    cursor: pointer;

    transition:
        transform 150ms ease,
        box-shadow 150ms ease,
        filter 150ms ease;
}

.submit-button:hover:not(:disabled) {
    transform: translateY(-1px);

    box-shadow:
        0 11px 24px rgba(42, 153, 196, 0.22);

    filter: brightness(0.98);
}

.submit-button:active:not(:disabled) {
    transform: translateY(0);
}

.submit-button:focus-visible {
    outline: 3px solid rgba(66, 174, 217, 0.25);
    outline-offset: 3px;
}

.submit-button:disabled {
    cursor: not-allowed;
    opacity: 0.7;
    box-shadow: none;
}

.spinner {
    width: 15px;
    height: 15px;

    border: 2px solid rgba(255, 255, 255, 0.35);
    border-top-color: #fff;
    border-radius: 50%;

    animation: spinner 700ms linear infinite;
}

@keyframes spinner {
    to {
        transform: rotate(360deg);
    }
}

.security-note {
    margin-top: 18px;

    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;

    color: #91a1ad;
    font-size: 10px;
}

/* ==========================================================
   RESPONSIVE
   ========================================================== */

@media (max-width: 1000px) {
    .login-page {
        grid-template-columns:
            minmax(330px, 0.8fr) minmax(480px, 1.2fr);
    }

    .brand-panel {
        padding:
            36px 34px 32px;
    }

    .brand-content h1 {
        font-size: 40px;
    }
}

@media (max-width: 820px) {
    .login-page {
        display: block;
        min-height: 100svh;
    }

    .brand-panel {
        display: none;
    }

    .login-panel {
        min-height: 100svh;

        padding:
            28px 20px 36px;

        flex-direction: column;
        justify-content: center;
    }

    .mobile-brand {
        width: 100%;
        max-width: 430px;

        margin-bottom: 24px;

        display: flex;
        align-items: center;
        gap: 10px;

        color: var(--navy);
        font-size: 16px;
        font-weight: 700;
    }

    .brand-mark--small {
        width: 36px;
        height: 36px;
    }

    .login-card {
        padding: 32px 28px;
    }
}

@media (max-width: 480px) {
    .login-panel {
        padding:
            24px 16px 32px;

        justify-content: flex-start;
    }

    .mobile-brand {
        margin-top: 12px;
        margin-bottom: 30px;
    }

    .login-card {
        padding: 0;

        border: 0;
        border-radius: 0;

        background: transparent;

        box-shadow: none;
    }

    .form-header {
        margin-bottom: 26px;
    }

    .form-header h2 {
        font-size: 27px;
    }

    .input-wrap input {
        height: 50px;
    }

    .submit-button {
        height: 50px;
    }
}

/* ==========================================================
   ACCESSIBILITY
   ========================================================== */

@media (prefers-reduced-motion: reduce) {

    *,
    *::before,
    *::after {
        scroll-behavior: auto !important;
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
}
</style>