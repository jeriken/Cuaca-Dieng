// People behind Cuaca Dieng, shown in the team popup (menu → Tim Kami).
// Photos: put a square image in public/img/team/ and set e.g. photo: '/img/team/razin.webp'.
// Until then the avatar shows the member's initials.
export const team = [
    {
        name: 'Muhammad Razin',
        role: 'Web Developer',
        bio: 'Founder Jeriken. Merancang tampilan dan membangun situs Cuaca Dieng.',
        photo: null,
        links: {
            instagram: 'https://www.instagram.com/pamerazin/',
            linkedin: 'https://www.linkedin.com/in/jeriken/',
            website: 'https://jeriken.com',
        },
    },
    {
        name: 'Havid Adhitama',
        role: 'IoT · Stasiun Cuaca',
        bio: 'Perakit stasiun cuaca Dieng. Radio amatir YD2CLX dan penulis North Backpacker.',
        photo: null,
        links: {
            instagram: 'https://www.instagram.com/havid_adhitama/',
            linkedin: 'https://www.linkedin.com/in/havid-adhitama/',
            website: 'https://www.northbackpacker.com/',
        },
    },
    {
        name: 'Aryadi Darwanto',
        role: 'Pengamat Embun Es',
        bio: 'Arkeolog Banjarnegara yang memantau suhu dan embun es serta mengenalkan sejarah Dieng.',
        photo: null,
        links: {
            instagram: 'https://www.instagram.com/aryadidarwanto/',
        },
    },
]

export const initials = (name) => name.split(' ').slice(0, 2).map(w => w[0]).join('')

// Placeholder avatar backgrounds, picked by member index — kept within the site's sky/indigo palette
export const AVATAR_GRADIENTS = ['from-sky-400 to-indigo-500', 'from-cyan-400 to-sky-500', 'from-indigo-400 to-violet-500']
