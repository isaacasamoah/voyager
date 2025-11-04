# Post 5: Communities, Not Users

**Theme:** The architecture decision that changed everything
**Emotional arc:** Individual focus → realization → community-first design
**Technical element:** Multi-tenant architecture, community-specific prompts

---

## Draft

I almost built the wrong product.

Early Voyager was designed for "users." Individual people with individual problems. Generic AI coaching for everyone.

Then I met a career coach named Eli who worked specifically with job seekers. He had a methodology. A philosophy. A way of thinking about careers that was distinct.

He asked: "Can Voyager learn MY approach?"

That question changed the architecture.

**The insight:**

People don't just want AI coaching. They want coaching that aligns with a specific methodology, philosophy, or community they're part of.

A career coach's approach is different from a startup advisor's approach.
A writing community values different things than a coding bootcamp.
Each community has its own language, values, and way of thinking.

**The technical shift:**

Instead of one AI for everyone, we built for communities:

- Each community gets its own "domain expertise"
- Prompts tuned to that community's methodology
- AI that speaks their language, values their principles
- But all on the same platform architecture

Careersy (Eli's community) became the first. Job seekers getting career coaching that reflects Eli's specific approach to career development—not generic advice.

**What this unlocked:**

Now Voyager isn't competing with "generic AI." It's enabling subject matter experts to multiply their impact. A coach can work with 10 people 1:1, or reach 1000 people through Voyager while maintaining their unique approach.

The AI doesn't replace the expert. It extends their reach.

**The architecture:**

Multi-tenant from day one. Community-specific prompts. Domain expertise as configuration, not code. Build once, customize infinitely.

This is why Voyager will work for career coaches, writing teachers, startup mentors, and communities we haven't imagined yet.

Next: The moment we realized the AI needed to ask more questions.

What's a community you're part of that has a distinct way of thinking? What makes their approach unique?

---

**Length:** ~290 words

**Technical details:**
- Multi-tenant architecture
- Community-specific domain expertise
- Careersy as first community
- Scalability through configuration

**Priya's notes:** This is the business model insight. Not B2C or B2B, but B2C2C (business to community to consumer). Shows product-market fit thinking.

**Marcus's notes:** Could mention the technical architecture (PostgreSQL multi-tenancy, community table, domain expertise JSON) but maybe too much detail for LinkedIn.
