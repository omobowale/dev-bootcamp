export interface SocialLink { platform: string; url: string; published: boolean }
export interface Testimonial { name: string; role: string; quote: string; avatarUrl: string; published: boolean }
export interface TeamMember { name: string; role: string; bio: string; avatarUrl: string; profileUrl: string; instructor: boolean; published: boolean }
export interface SiteContent { supportEmail: string; whatsappNumber: string; socialLinks: SocialLink[]; testimonials: Testimonial[]; team: TeamMember[] }
export interface SiteContentDocument { version: number; content: SiteContent }
