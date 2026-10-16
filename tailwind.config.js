/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
  	extend: {
  		fontFamily: {
  			heading: ['Space Grotesk', 'sans-serif'],
  			body: ['Inter', 'sans-serif'],
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			/* Linkzone Global palette: purple-family scales remapped to coral, indigo to navy */
  			violet: {50:'#FDF4F0',100:'#F8E5DE',200:'#F3CBBC',300:'#EEA990',400:'#EB8463',500:'#E96F4C',600:'#E8603C',700:'#C94E2E',800:'#A33F26',900:'#7F3220',950:'#451A10'},
  			purple: {50:'#FDF4F0',100:'#F8E5DE',200:'#F3CBBC',300:'#EEA990',400:'#EB8463',500:'#E96F4C',600:'#E8603C',700:'#C94E2E',800:'#A33F26',900:'#7F3220',950:'#451A10'},
  			fuchsia: {50:'#FDF4F0',100:'#F8E5DE',200:'#F3CBBC',300:'#EEA990',400:'#EB8463',500:'#E96F4C',600:'#E8603C',700:'#C94E2E',800:'#A33F26',900:'#7F3220',950:'#451A10'},
  			indigo: {50:'#F4F5F9',100:'#E7E9EE',200:'#C9CEDD',300:'#9AA4C0',400:'#5F6B90',500:'#2E3A63',600:'#141E3E',700:'#0C1329',800:'#0A1024',900:'#070C1B',950:'#04070F'},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			navy: {
  				DEFAULT: 'hsl(var(--navy))',
  				foreground: 'hsl(var(--navy-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}