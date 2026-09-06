<template>
    <div class="min-h-screen overflow-hidden bg-cafe-paper font-cafe text-cafe-ink">

        <Head>
            <Title>Brthrs Cafe — Coffee, comfort, and good company</Title>
            <Meta name="description"
                content="Brthrs Cafe in Bo. Obrero, Davao City. Open every day from 11 AM to midnight." />
            <Link rel="preconnect" href="https://fonts.googleapis.com" />
            <Link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
            <Link
                href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:ital,wght@1,600;1,700&display=swap"
                rel="stylesheet" />
        </Head>

        <header
            class="relative z-10 flex h-[74px] items-center justify-between border-b border-cafe-ink/10 px-6 sm:h-[86px] sm:px-[6vw]">
            <NuxtLink to="/" class="inline-flex items-center gap-3" aria-label="Brthrs Cafe home">
                <span class="grid size-10 place-items-center rounded-full border-2 border-cafe-ink" aria-hidden="true">
                    <Icon name="ph:coffee" class="size-5" />
                </span>
                <span class="flex flex-col leading-[.8]">
                    <strong class="text-[22px] tracking-[-1px]">Brthrs</strong>
                    <small class="mt-1 font-display text-sm italic text-cafe-brown">cafe</small>
                </span>
            </NuxtLink>
            <nav class="hidden gap-9 md:flex" aria-label="Main navigation">
                <a v-for="link in navigation" :key="link.href" :href="link.href"
                    class="text-[13px] font-semibold transition hover:text-cafe-brown">
                    {{ link.label }}
                </a>
            </nav>
        </header>

        <main>
            <section class="grid min-h-[calc(100vh-74px)] lg:min-h-[calc(100vh-86px)] lg:grid-cols-[1.05fr_.95fr]">
                <div
                    class="flex min-h-[650px] flex-col justify-center px-6 py-16 sm:min-h-[720px] sm:px-[7vw] sm:py-[10vh]">
                    <p
                        class="flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[2.2px] text-cafe-brown">
                        <span class="h-px w-8 bg-cafe-brown"></span>Your neighborhood hidden space
                    </p>
                    <h1
                        class="my-7 text-[53px] font-bold leading-[.92] tracking-[-3px] sm:text-[clamp(64px,7vw,104px)] sm:tracking-[-5px]">
                        Good coffee.<br>
                        <em class="font-display font-semibold text-cafe-brown">Better company.</em>
                    </h1>
                    <p class="max-w-xl text-[17px] leading-7 text-stone-600">
                        A laid-back corner in Obrero for slow
                        afternoons, late-night conversations, and coffee made for sharing.
                    </p>
                    <div class="mt-8 flex flex-col gap-3 sm:flex-row">
                        <a href="#visit"
                            class="inline-flex items-center justify-center gap-2 rounded bg-cafe-ink px-5 py-3.5 text-[13px] font-bold text-white transition hover:bg-cafe-brown">Find
                            our place
                            <Icon name="ph:map-pin" class="size-4" />
                        </a>
                        <a href="#favorites"
                            class="inline-flex items-center justify-center gap-2 rounded border border-cafe-ink/20 px-5 py-3.5 text-[13px] font-bold transition hover:bg-cafe-cream">Explore
                            favorites
                            <Icon name="ph:arrow-down" class="size-4" />
                        </a>
                    </div>
                    <div class="mt-14 flex flex-col gap-5 border-t border-cafe-ink/10 pt-7 sm:flex-row sm:gap-11">
                        <div v-for="fact in quickFacts" :key="fact.label" class="flex items-center gap-3">
                            <Icon :name="fact.icon" class="size-6 text-cafe-brown" />
                            <span class="flex flex-col">
                                <small class="text-[10px] uppercase tracking-wider text-stone-500">
                                    {{ fact.label }}
                                </small>
                                <strong class="mt-1 text-[13px]">{{ fact.value }}</strong>
                            </span>
                        </div>
                    </div>
                </div>

                <div class="relative min-h-[520px] overflow-hidden bg-cafe-clay p-7 text-white sm:min-h-[630px] sm:p-12"
                    aria-label="Brthrs Cafe, brewed daily in Davao City">
                    <div class="absolute -right-24 -top-24 size-80 rounded-full border border-white/20"></div>
                    <div class="absolute -bottom-36 -left-20 size-96 rounded-full bg-cafe-ink/10"></div>
                    <div
                        class="absolute left-1/2 top-1/2 size-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cafe-sun/70 blur-3xl sm:size-96">
                    </div>
                    <div class="relative z-10 flex h-full min-h-[466px] flex-col justify-between sm:min-h-[534px]">
                        <div
                            class="flex items-center justify-between border-b border-white/25 pb-5 text-[10px] font-bold uppercase tracking-[2px]">
                            <span>Obrero · Davao City</span>
                            <span>Open until midnight</span>
                        </div>
                        <div
                            class="mx-auto flex size-64 flex-col items-center justify-center rounded-full border border-white/35 bg-cafe-paper/90 text-cafe-ink shadow-2xl sm:size-80">
                            <Icon name="ph:coffee" class="mb-5 size-12 text-cafe-brown sm:size-16" />
                            <strong class="text-5xl tracking-[-3px] sm:text-6xl">Brthrs</strong>
                            <em class="mt-2 font-display text-3xl text-cafe-brown">cafe</em>
                        </div>
                        <div class="flex items-end justify-between gap-6">
                            <p class="max-w-[16rem] font-display text-xl italic leading-snug sm:text-2xl">A hidden
                                corner for coffee and company.</p>
                            <Icon name="ph:arrow-down-right" class="size-8 shrink-0" />
                        </div>
                    </div>
                </div>
            </section>

            <section id="story"
                class="grid gap-16 bg-cafe-cream px-6 py-20 sm:px-[7vw] sm:py-28 lg:grid-cols-2 lg:gap-[8vw]">
                <div>
                    <p class="text-[11px] font-bold tracking-[2.2px] text-cafe-brown">01 / OUR PLACE</p>
                    <h2 class="my-6 text-[clamp(38px,4.6vw,67px)] font-bold leading-[1.05] tracking-[-2.5px]">
                        Come as
                        you are.<br>Stay as long as you like.
                    </h2>
                    <p class="max-w-xl leading-7 text-stone-600">
                        Brthrs Cafe is the kind of place you discover, then
                        keep to yourself for a while. Tucked beside Brotherr's Fried Chicken, our little space is made
                        for catching up, getting work done, or simply enjoying a quiet cup.
                    </p>
                    <p class="mt-9 font-display text-xl italic text-cafe-brown">
                        Your hidden corner in Obrero.
                    </p>
                </div>
                <div class="grid min-h-[410px] gap-3 sm:min-h-[470px] sm:grid-cols-2 sm:grid-rows-2">
                    <div
                        class="flex min-h-44 flex-col justify-end gap-5 rounded bg-cafe-ink p-7 font-semibold text-white sm:row-span-2">
                        <Icon name="ph:coffee" class="size-8" />
                        <span>Carefully brewed</span>
                    </div>
                    <div class="rounded bg-cafe-gold p-7 font-display text-2xl italic">
                        Late nights.<br>Warm
                        lights.<br><strong>Good vibes.</strong>
                    </div>
                    <div class="flex flex-col justify-between rounded bg-stone-300 p-7 font-semibold text-cafe-brown">
                        <Icon name="ph:users-three" class="size-8" />
                        <span>Made for company</span>
                    </div>
                </div>
            </section>

            <section id="favorites" class="px-6 py-20 sm:px-[7vw] sm:py-28">
                <div class="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
                    <div>
                        <p class="text-[11px] font-bold tracking-[2.2px] text-cafe-brown">02 / CAFE FAVORITES</p>
                        <h2 class="mt-5 text-[clamp(38px,4.6vw,67px)] font-bold leading-[1.05] tracking-[-2.5px]">
                            Something for every mood.
                        </h2>
                    </div>
                    <p class="max-w-sm leading-7 text-stone-600">
                        From cold, creamy picks to comforting hot cups—find
                        your usual or try something new.
                    </p>
                </div>
                <div class="mt-10 grid gap-5 lg:mt-14 lg:grid-cols-3">
                    <article v-for="item in favorites" :key="item.name"
                        :class="['relative flex min-h-60 flex-col overflow-hidden rounded p-8 lg:min-h-[330px]', item.className]">
                        <span class="mb-auto grid size-12 place-items-center rounded-full border border-current">
                            <Icon :name="item.icon" class="size-6" />
                        </span>
                        <p class="text-[9px] font-bold tracking-[1.8px]">
                            {{ item.kicker }}
                        </p>
                        <h3 class="my-2 font-display text-3xl italic">
                            {{ item.name }}
                        </h3>
                        <span class="text-xs opacity-70">{{ item.note }}</span>
                        <span
                            class="absolute -bottom-14 -right-14 size-44 rounded-full border border-current opacity-10"></span>
                    </article>
                </div>
                <p class="mt-8 text-center text-xs text-stone-500">
                    <Icon name="ph:sparkle" class="mr-1 inline size-4 text-cafe-gold" />
                    Ask our barista about today's
                    recommendations and available add-ons.
                </p>
            </section>

            <section id="visit"
                class="grid gap-14 bg-cafe-forest px-6 py-20 text-white sm:px-[7vw] sm:py-28 lg:grid-cols-[1.05fr_.95fr] lg:gap-[9vw]">
                <div>
                    <p class="text-[11px] font-bold tracking-[2.2px] text-cafe-gold">03 / COME THROUGH</p>
                    <h2 class="my-6 text-[clamp(38px,4.6vw,67px)] font-bold leading-[1.05] tracking-[-2.5px]">
                        Your next
                        coffee break is closer than you think.
                    </h2>
                    <p class="max-w-lg leading-7 text-emerald-100/60">
                        Look for the hidden space of Brotherr's Fried
                        Chicken near the USEP Obrero main gate.
                    </p>
                </div>
                <div
                    class="flex flex-col justify-center gap-11 border-t border-white/15 pt-12 lg:border-l lg:border-t-0 lg:pl-[8vw] lg:pt-0">
                    <div v-for="detail in visitDetails" :key="detail.label" class="flex gap-5">
                        <span
                            class="grid size-12 shrink-0 place-items-center rounded-full border border-white/20 text-cafe-gold">
                            <Icon :name="detail.icon" class="size-5" />
                        </span>
                        <div class="flex flex-col">
                            <small class="mb-2 text-[9px] tracking-[2px] text-cafe-gold">
                                {{ detail.label }}
                            </small>
                            <strong class="whitespace-pre-line text-xl leading-7">
                                {{ detail.value }}
                            </strong>
                            <p class="mt-2 text-xs text-emerald-100/50">
                                {{ detail.note }}
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </main>

        <footer
            class="flex flex-wrap items-center gap-7 border-t border-cafe-ink/10 px-6 py-9 text-[11px] text-stone-500 sm:px-[7vw]">
            <div class="mr-auto inline-flex items-center gap-2 text-cafe-ink">
                <span class="grid size-8 place-items-center rounded-full border-2 border-cafe-ink">
                    <Icon name="ph:coffee" class="size-4" />
                </span>
                <strong class="text-lg">Brthrs Cafe</strong>
            </div>
            <p class="hidden sm:block">Good coffee, better company.</p>
            <div class="flex items-center gap-2" aria-label="Brthrs Cafe social media">
                <a v-for="social in socials" :key="social.label" :href="social.href" target="_blank"
                    rel="noopener noreferrer" :aria-label="`Follow Brthrs Cafe on ${social.label}`"
                    class="inline-flex items-center gap-1.5 rounded-full border border-cafe-ink/15 px-3 py-2 font-semibold text-cafe-ink transition hover:-translate-y-0.5 hover:border-cafe-brown/50 hover:bg-cafe-cream hover:text-cafe-brown">
                    <Icon :name="social.icon" class="size-4" /> {{ social.label }}
                </a>
            </div>
            <span>&copy; {{ new Date().getFullYear() }} Brthrs Cafe · Davao City</span>
        </footer>
    </div>
</template>

<script setup lang="ts">
const navigation = [
    { label: 'Our place', href: '#story' },
    { label: 'Favorites', href: '#favorites' },
    { label: 'Visit us', href: '#visit' }
]

const quickFacts = [
    { label: 'Open every day', value: '11 AM — 12 Midnight', icon: 'ph:clock' },
    { label: 'Find us in', value: 'Bo. Obrero, Davao City', icon: 'ph:map-pin' }
]

const favorites = [
    { kicker: 'COOL & SMOOTH', name: 'Iced favorites', note: 'For warm Davao afternoons', icon: 'ph:snowflake', className: 'bg-cafe-iced text-cafe-icedText' },
    { kicker: 'RICH & COZY', name: 'Hot classics', note: 'Comfort in every cup', icon: 'ph:coffee', className: 'bg-cafe-hot text-white' },
    { kicker: 'MAKE IT YOURS', name: 'Cafe add-ons', note: 'A little extra goes a long way', icon: 'ph:plus-circle', className: 'bg-cafe-addOn text-cafe-addOnText' },
]

const visitDetails = [
    { label: 'ADDRESS', value: 'Iñigo St., Bo. Obrero,\nDavao City', note: 'Near USEP Obrero main gate', icon: 'ph:map-pin' },
    { label: 'BUSINESS HOURS', value: 'Every day\n11 AM — 12 Midnight', note: "Yes, we're open late.", icon: 'ph:clock' },
]

const socials = [
    { label: 'Instagram', href: 'https://www.instagram.com/brthrs_cafe', icon: 'ph:instagram-logo' },
    { label: 'TikTok', href: 'https://www.tiktok.com/@brthrscafe', icon: 'ph:tiktok-logo' },
]
</script>
