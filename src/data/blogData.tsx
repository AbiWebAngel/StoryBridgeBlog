import { BlogPost } from '@/types/blog';

export const blogData: BlogPost[] = [
  {
    id: 1,
    title: "Writing Motivation #1",
    slug: "writing-motivation-1",
    coverImage: "/assets/images/home/blog1.jpg",
    excerpt: (
      <div className="space-y-4 text-[16px] sm:text-[17px] lg:text-[18px] font-inter">
        {`In honour of one of our bloggers turning 15, here are `}
        <span style={{ color: "#CF822A", fontWeight: 600 }}>
          15 motivational quotes
        </span>
        {` to start your day off sprinting (writing sprints).`}
        <br />
        <br />
        {`1. "You do not have to be fire to burn. You only need to be awake." – Unknown`}
        <br />
        {`2. "Discipline is choosing between what you want now and what you want most." – Attributed to Abraham Lincoln, and Psychotherapist Augusta F. Kantra.`}
        <br />
        {`3. "Success is not final, failure is not fatal; it's the courage to continue that counts." – Winston Churchill`}
        <br />
        {`4. "Everyone has a story, a writer is the only one brave enough to tell it." – Abigail...`}
      </div>
    ),
    fullContent: (
      <div className="space-y-6 text-[16px] sm:text-[17px] lg:text-[18px] font-inter leading-relaxed">
        <p>
          {`In honour of one of our bloggers turning 15, here are `}
          <span style={{ color: "#CF822A", fontWeight: 600 }}>
            15 motivational quotes
          </span>
          {` to start your day off sprinting (writing sprints).`}
        </p>
        
        <div className="space-y-4">
          <p>1. &quot;You do not have to be fire to burn. You only need to be awake.&quot; – Unknown</p>
          <p>2. &quot;Discipline is choosing between what you want now and what you want most.&quot; – Attributed to Abraham Lincoln, and Psychotherapist Augusta F. Kantra.</p>
          <p>3. &quot;Success is not final, failure is not fatal; it&apos;s the courage to continue that counts.&quot; – Winston Churchill</p>
          <p>4. &quot;Everyone has a story, a writer is the only one brave enough to tell it.&quot; – Abigail Reed</p>
          <p>5. &quot;The scariest moment is always just before you start.&quot; – Stephen King</p>
          <p>6. &quot;You can always edit a bad page. You can&apos;t edit a blank page.&quot; – Jodi Picoult</p>
          <p>7. &quot;Start writing, no matter what. The water does not flow until the faucet is turned on.&quot; – Louis L&apos;Amour</p>
          <p>8. &quot;Get it down. Take chances. It may be bad, but it&apos;s the only way you can do anything really good.&quot; – William Faulkner</p>
          <p>9. &quot;The first draft is just you telling yourself the story.&quot; – Terry Pratchett</p>
          <p>10. &quot;You fail only if you stop writing.&quot; – Ray Bradbury</p>
          <p>11. &quot;A professional writer is an amateur who didn&apos;t quit.&quot; – Richard Bach</p>
          <p>12. &quot;Don&apos;t tell me the moon is shining; show me the glint of light on broken glass.&quot; – Anton Chekhov</p>
          <p>13. &quot;Write what should not be forgotten.&quot; – Isabel Allende</p>
          <p>14. &quot;The role of a writer is not to say what we all can say, but what we are unable to say.&quot; – Anaïs Nin</p>
          <p>15. &quot;One day I will find the right words, and they will be simple.&quot; – Jack Kerouac</p>
        </div>
      </div>
    ),
    date: "2024-01-15",
    author: "StoryBridge Team"
  },
  {
    id: 2,
    title: "Beta reading #2: How to have a successful beta-reader/writer relationship: Building bridges",
    slug: "beta-reading-2",
    coverImage: "/assets/images/home/blog2.jpg",
    excerpt: (
      <div className="space-y-4 text-[16px] sm:text-[17px] lg:text-[18px] font-inter">
        <strong>Preface:</strong>
        <br />
        {`Before I get into this week's content, the StoryBridge team wants to congratulate you all for being here!`}
        <br />
        {`Why? Because it's no easy task to trust others with your creativity or be tactful and truthful in your reviews.`}
        <br />
        {`Yet you've decided to try, and that's half the battle. Which is why I've decided to make a simple, step-by-step guide on getting the most of your beta-reader/writer pairing. The analogy I'll be using is inspired by our namesake, hence: "Building bridges."`}
        <br />
        <strong>Step 1: Know your foundation</strong>
        <br />
        {`"The whole point of a beta reader is to get into the nitty-gritty subjects—deeper than just 'what did you like and what didn't you like?'...`}
      </div>
    ),
    fullContent: (
        <div className="space-y-6 text-[16px] sm:text-[17px] lg:text-[18px] font-inter leading-relaxed">
        <div>
          <strong>Preface:</strong>
          <p>Before I get into this week&apos;s content, the StoryBridge team wants to congratulate you all for being here!</p>
          <p>Why? Because it&apos;s no easy task to trust others with your creativity or be tactful and truthful in your reviews.</p>
          <p>
            Yet you&apos;ve decided to try, and that&apos;s half the battle. Which is why I&apos;ve decided to make a simple, step-by-step guide on getting the most of your beta-reader/writer pairing. The analogy I&apos;ll be using is inspired by our namesake, hence: &ldquo;Building bridges.&rdquo;
          </p>
        </div>
        <div className="space-y-4">
          <strong>Step 1: Know your foundation</strong>
          <p>&quot;The whole point of a beta reader is to get into the nitty-gritty subjects—deeper than just &apos;what did you like and what didn&apos;t you like?&apos; You&apos;re looking for feedback on character development, plot holes, pacing, and overall coherence.</p>
          <p>As a writer, be clear about what you want feedback on. Are you concerned about your protagonist&apos;s likability? The pacing in the middle chapters? The clarity of your world-building?</p>
        </div>

        <div className="space-y-4">
          <strong>Step 2: Set clear expectations</strong>
          <p>Establish deadlines, preferred communication methods, and the scope of feedback. Some writers want line-by-line edits, while others prefer big-picture thoughts.</p>
        </div>

        <div className="space-y-4">
          <strong>Step 3: Build trust through respect</strong>
          <p>Remember that creative work is personal. Be constructive in your criticism and specific in your praise. As a beta reader, your role is to help the writer see their work through fresh eyes, not to rewrite it in your own voice.</p>
        </div>

        <div className="space-y-4">
          <strong>Step 4: Maintain the structure</strong>
          <p>Regular check-ins can prevent misunderstandings and keep the process moving forward. A quick &quot;how&apos;s it going?&quot; message can work wonders.</p>
        </div>

        <div className="space-y-4">
          <strong>Step 5: Cross the bridge together</strong>
          <p>The best beta relationships become collaborative partnerships where both parties grow. You&apos;re not just critiquing a manuscript—you&apos;re helping build a better story.</p>
        </div>
      </div>
    ),
    date: "2024-01-22",
    author: "Sarah Johnson"
  },
  {
    id: 3,
    title: "Author Interview #3: Finding your voice in a noisy world",
    slug: "author-interview-3",
    coverImage: "/assets/images/home/blog1.jpg",
    excerpt: (
      <div className="space-y-4 text-[16px] sm:text-[17px] lg:text-[18px] font-inter">
        {`This week, we sit down with `}
        <span style={{ color: "#CF822A", fontWeight: 600 }}>Lena Harper</span>
        {`, an indie author who has made waves with her debut novel, `}
        <em>{`"The Silence Between Notes."`}</em>
        <br />
        {`We talked about how she discovered her writing voice amidst the endless online advice, critique circles, and self-doubt.`}
        <br />
        <strong>{`"Voice isn't something you find—it's something you allow,"`}</strong>
        {` she said. `}
        {`"The more you imitate others, the quieter yours becomes."`}
        <br />
        {`Her advice to emerging writers? `}
        <em>{`"Stop trying to sound like a writer. Start trying to sound like you."`}</em>
      </div>
    ),
    fullContent: (
     <div className="space-y-6 text-[16px] sm:text-[17px] lg:text-[18px] font-inter leading-relaxed">
      <p>
        This week, we sit down with{" "}
        <span style={{ color: "#CF822A", fontWeight: 600 }}>Lena Harper</span>
        , an indie author who has made waves with her debut novel,{" "}
        <em>&quot;The Silence Between Notes.&quot;</em>
      </p>
      
      <p>We talked about how she discovered her writing voice amidst the endless online advice, critique circles, and self-doubt.</p>
      
      <p>
        <strong>&quot;Voice isn&apos;t something you find—it&apos;s something you allow,&quot;</strong>
        {" she said. "}
        &quot;The more you imitate others, the quieter yours becomes.&quot;
      </p>
      
      <p>
        Her advice to emerging writers?{" "}
        <em>&quot;Stop trying to sound like a writer. Start trying to sound like you.&quot;</em>
      </p>

      <p>Lena&apos;s journey to finding her voice wasn&apos;t easy. She spent years trying to emulate her favorite authors before realizing that her unique perspective was her greatest strength.</p>

      <p>&quot;I kept getting feedback that my writing was &apos;too emotional&apos; or &apos;too detailed,&apos;&quot; she recalls. &quot;Then I realized—that&apos;s me. That&apos;s how I experience the world. Once I embraced that, the words started flowing naturally.&quot;</p>

      <p>When asked about dealing with criticism, Lena had this to say: &quot;Not every piece of advice is right for your story. Learn to distinguish between feedback that improves your work and feedback that tries to change your voice.&quot;</p>

      <p>Her final thoughts? &quot;Your voice is already there. Stop looking for it in writing manuals and start listening to the stories only you can tell.&quot;</p>
    </div>
    ),
    date: "2024-01-29",
    author: "Mike Chen"
  },
  {
    id: 4,
    title: "What to Write Wednesday #4: Overcoming creative blocks",
    slug: "what-to-write-wednesday-4",
    coverImage: "/assets/images/home/blog2.jpg",
    excerpt: (
      <div className="space-y-4 text-[16px] sm:text-[17px] lg:text-[18px] font-inter">
        {`Stuck staring at a blinking cursor? Don't panic—every writer has been there.`}
        <br />
        {`Let's talk about some practical ways to break through that wall.`}
        <br />
        <strong>{`1. Move, don't mope:`}</strong>
        {` Take a walk, stretch, or clean your workspace. Your brain resets when your body moves.`}
        <br />
        <strong>{`2. Write terribly—on purpose:`}</strong>
        {` Lower the stakes. A bad page can be edited; a blank one can't.`}
        <br />
        <strong>{`3. Feed your creative well:`}</strong>
        {` Read something outside your genre or listen to a podcast that inspires curiosity.`}
        <br />
        {`Remember, the goal isn't perfection—it's momentum. Writing is a muscle, and even small reps count.`}
      </div>
    ),
    fullContent: (
     <div className="space-y-6 text-[16px] sm:text-[17px] lg:text-[18px] font-inter leading-relaxed">
      <p>Stuck staring at a blinking cursor? Don&apos;t panic—every writer has been there.</p>
      
      <p>Let&apos;s talk about some practical ways to break through that wall.</p>

      <div className="space-y-4">
        <p>
          <strong>1. Move, don&apos;t mope:</strong>
          {` Take a walk, stretch, or clean your workspace. Your brain resets when your body moves.`}
        </p>
        
        <p>
          <strong>2. Write terribly—on purpose:</strong>
          {` Lower the stakes. A bad page can be edited; a blank one can&apos;t.`}
        </p>
        
        <p>
          <strong>3. Feed your creative well:</strong>
          {` Read something outside your genre or listen to a podcast that inspires curiosity.`}
        </p>
        
        <p>
          <strong>4. Change your environment:</strong>
          {` Sometimes a different location—a coffee shop, library, or even a different room—can shake loose new ideas.`}
        </p>
        
        <p>
          <strong>5. Use writing prompts:</strong>
          {` Set a timer for 10 minutes and write about anything that comes to mind. The goal is to get words flowing, not to produce perfect prose.`}
        </p>
        
        <p>
          <strong>6. Talk it out:</strong>
          {` Explain your block to a friend or record a voice memo to yourself. Often, speaking about the problem helps you see the solution.`}
        </p>
        
        <p>
          <strong>7. Lower your daily goal:</strong>
          {` Instead of aiming for 1,000 words, try for 100. Small wins build momentum.`}
        </p>
      </div>

      <p>Remember, the goal isn&apos;t perfection—it&apos;s momentum. Writing is a muscle, and even small reps count.</p>

      <p>Creative blocks are temporary. Trust that your creativity will return, and in the meantime, be kind to yourself. The words will come when you create space for them.</p>
    </div>
    ),
    date: "2024-02-05",
    author: "Alex Rivera"
  }
];

// Helper function to get blog post by slug
export const getBlogPostBySlug = (slug: string): BlogPost | undefined => {
  return blogData.find(post => post.slug === slug);
};

// Helper function to get all blog posts
export const getAllBlogPosts = (): BlogPost[] => {
  return blogData;
};