<conversation_summary>

<decisions>
1. Input will be plain text (up to 10k characters); flashcards limited to 200 chars (front) and 500 chars (back).  
2. AI flashcard generation will mix summarization and extraction.  
3. Regenerated flashcards overwrite existing ones (no version history).  
4. Users can fully edit, regenerate, and save AI-generated flashcards.  
5. Interface will prioritize simplicity over flexibility.  
6. Success criterion: 75% AI flashcard acceptance per session.  
7. Linear user process: input text → specify number of cards → AI generates cards → user edits/regenerates → save all.  
8. Flashcards can be categorized by projects (folders) with title, short description, date, and tag metadata.  
9. Users can rename and delete projects.  
10. Thumbs up/down used to track AI flashcard acceptance (analytics only, no feedback loop).  
11. AI proposes all flashcard types (open-ended, fill-in-the-blank, multiple choice without distractors).  
12. Review table (done/new/upcoming/to learn) updates after session completion only.  
13. Tech stack: Astro 5, TypeScript 5, React 19, Tailwind 4, Supabase for auth + database.  
14. Flashcards stored as individual records linked to project IDs.  
15. AI-generated flashcards saved as drafts until user confirmation.  
16. Error handling includes retry message (“Generation failed, please try again”).  
17. MVP development plan:  
    - Week 1: UI + Database  
    - Week 2: AI Integration  
    - Week 3: Testing  
    - Week 4: Go Live  
18. Testing will include unit and Playwright E2E tests.  
19. Internal analytics page (not user-facing) will track 75% acceptance KPI.  
20. Go-live deployment platform not specified.  
</decisions>

<matched_recommendations>
1. Define clear generation logic combining extraction and summarization to ensure high-quality flashcards within text limits.  
2. Implement a linear, step-by-step flow for flashcard creation to ensure a simple and predictable UX.  
3. Display project metadata (title, date, tag) in dashboard view for easier organization and navigation.  
4. Use Supabase for authentication and data storage to streamline development.  
5. Introduce clear error handling for AI generation failures to improve user trust.  
6. Store flashcards as individual records linked to project IDs to support scalability.  
7. Include a lightweight analytics dashboard to monitor success metrics and measure AI flashcard acceptance.  
8. Use a weekly milestone-based roadmap to ensure 4-week MVP delivery.  
9. Prioritize CRUD and AI generation test coverage in unit and E2E tests for stable MVP validation.  
10. Keep interface simple, focusing on core linear functionality before adding advanced options.  
</matched_recommendations>

<prd_planning_summary>
**Main Functional Requirements:**  
- **AI Generation:** Mix of summarization and extraction for flashcard creation from user-provided text (up to 10k characters).  
- **Manual Editing:** Users can fully edit and regenerate flashcards; regenerated versions overwrite previous ones.  
- **Organization:** Flashcards grouped by projects (folders) with metadata: title, short description, date, and tag.  
- **Storage:** Flashcards saved as individual records in Supabase, linked to project IDs. Drafts persist until user saves.  
- **Interface:** Simple and linear UX (input → generate → edit → save).  
- **Review & Tracking:** Overview table showing progress (done/new/upcoming/to learn), updated after each session.  
- **Feedback:** Users can rate flashcards with thumbs up/down (for analytics only).  
- **Error Handling:** Retry message for failed AI generation attempts.  
- **Testing:** Unit and Playwright E2E tests for CRUD and AI flows.  
- **Analytics:** Internal dashboard to track AI acceptance rates (75% KPI).  
- **Timeline:** 4-week MVP roadmap with weekly milestones for UI, AI integration, testing, and go-live.  

**Key User Stories & Usage Paths:**  
1. As a user, I can paste text and specify the number of flashcards I want generated.  
2. As a user, I can review AI-generated flashcards, edit them, regenerate, and save.  
3. As a user, I can create, rename, or delete projects to organize flashcards.  
4. As a user, I can view my flashcard progress in a simple post-session overview.  
5. As an admin, I can monitor AI flashcard acceptance metrics to evaluate product success.  

**Success Criteria & Measurement:**  
- 75% of AI-generated flashcards accepted by users per session (measured via thumbs up/down feedback).  
- 75% of total flashcards created through AI generation (tracked in internal analytics).  
- MVP delivery within 4 weeks following milestone roadmap.  

**Design Constraints:**  
- Web-only MVP (no mobile apps).  
- Simple interface with limited customization.  
- Supabase-based backend for both auth and data management.  
- No version history or advanced repetition algorithm.  

</prd_planning_summary>

<unresolved_issues>
1. Decision pending on scope and priority of automated tests (unit vs. E2E balance).  
2. Final hosting/deployment environment not confirmed (e.g., Vercel, Netlify).  
3. No explicit plan for user testing or feedback collection beyond internal QA.  
</unresolved_issues>

</conversation_summary>
