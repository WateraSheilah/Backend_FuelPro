import NextAuth from "next-auth"
import GoogleProvider from 'next-auth/providers/google';
export const authOptions = {
    // Configure one or more authentication providers
    providers: [
        GoogleProvider({
           clientId:"http://53036513962-kv5god0hb14go2mj23b977m2h68oal9t.apps.googleusercontent.com",
           clientSecret:"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"
        }),
        // ...add more providers here
    ],
    
}
export default NextAuth(authOptions)