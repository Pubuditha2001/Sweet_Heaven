import { useEffect, useRef, useState } from "react";

export const useScrollToSection = () => {
  const [activeSection, setActiveSection] = useState(null);
  const sectionsRef = useRef({});

  const registerSection = (name, ref) => {
    sectionsRef.current[name] = ref;
  };

  const scrollToSection = (sectionName, offset = 0) => {
    const section = sectionsRef.current[sectionName];
    if (section?.current) {
      const elementPosition = section.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  // Intersection Observer to track active section
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.dataset.section);
          }
        });
      },
      {
        rootMargin: "-80px 0px -80% 0px",
        threshold: 0.1,
      }
    );

    Object.entries(sectionsRef.current).forEach(([name, ref]) => {
      if (ref.current) {
        ref.current.dataset.section = name;
        observer.observe(ref.current);
      }
    });

    return () => observer.disconnect();
  }, []);

  return {
    registerSection,
    scrollToSection,
    activeSection,
  };
};
