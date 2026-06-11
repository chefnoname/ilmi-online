"use client";

const ustadh = "/landing/ustadh-yasin.jpeg";

const Instructor = () => {
  return (
    <section id="instructor" className="section-padding bg-muted/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-8 sm:mb-12">
            <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Meet Your Teacher
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
              Meet Your <span className="gradient-text">Ustādh</span>
            </h2>
          </div>

          {/* Content */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Image */}
            <div className="relative mx-auto max-w-xs sm:max-w-sm lg:max-w-none">
              <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border-2 sm:border-4 border-primary/20 shadow-lg">
                <img
                  src={ustadh}
                  alt="Ustadh Yasin Munye"
                  className="aspect-[4/5] w-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
              </div>
              <div className="absolute -bottom-3 -right-3 sm:-bottom-4 sm:-right-4 -z-10 h-full w-full rounded-xl sm:rounded-2xl bg-primary/10" />
            </div>

            {/* Bio */}
            <div className="space-y-4 sm:space-y-6">
              <div>
                <h3 className="font-heading text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-1">
                  Ustādh Yasin Munye
                </h3>
                <p className="text-sm sm:text-lg text-primary">
                  Scholar of Islamic Studies and Arabic
                </p>
              </div>

              <div className="space-y-3 sm:space-y-4 text-sm sm:text-base leading-relaxed text-muted-foreground">
                <p>
                  Ustaadh Yasin is a traditionally trained scholar with formal Islamic studies qualifications and ijazah in core disciplines.
                </p>
                <p>
                  He studied foundational texts under recognised scholars, grounding his understanding in the classical tradition before dedicating himself to teaching.
                </p>
                <p>
                  For years, he has guided students through structured study of <span className="text-primary font-medium">aqeedah</span>, <span className="text-primary font-medium">fiqh</span>, and essential Islamic sciences, helping them build clarity from the foundations upward.
                </p>
                <p>
                  His approach combines depth with clarity, ensuring that complex subjects are understood properly, not oversimplified or rushed.
                </p>
                <p>
                  Under his guidance, students build deep understanding of topics.
                </p>
              </div>

              {/* Credentials */}
              <div className="grid grid-cols-2 gap-2 sm:gap-4 pt-2 sm:pt-4">
                <div className="rounded-lg sm:rounded-xl bg-card/75 backdrop-blur-xl border border-border/50 p-3 sm:p-4 text-center">
                  <div className="text-sm sm:text-lg font-bold gradient-text leading-tight">Hafidh of the Qur'an</div>
                  <div className="text-[10px] sm:text-sm text-muted-foreground mt-1">Ijāza Holder</div>
                </div>
                <div className="rounded-lg sm:rounded-xl bg-card/75 backdrop-blur-xl border border-border/50 p-3 sm:p-4 text-center">
                  <div className="text-sm sm:text-lg font-bold gradient-text leading-tight">Advanced Postgraduate</div>
                  <div className="text-[10px] sm:text-sm text-muted-foreground mt-1">Islamic Studies</div>
                </div>
                <div className="rounded-lg sm:rounded-xl bg-card/75 backdrop-blur-xl border border-border/50 p-3 sm:p-4 text-center">
                  <div className="text-sm sm:text-lg font-bold gradient-text leading-tight">Studied in</div>
                  <div className="text-[10px] sm:text-sm text-muted-foreground mt-1">Makkah, Madinah & Egypt</div>
                </div>
                <div className="rounded-lg sm:rounded-xl bg-card/75 backdrop-blur-xl border border-border/50 p-3 sm:p-4 text-center">
                  <div className="text-sm sm:text-lg font-bold gradient-text leading-tight">Multiple Ijāzāt</div>
                  <div className="text-[10px] sm:text-sm text-muted-foreground mt-1">in Core Sciences</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Instructor;
