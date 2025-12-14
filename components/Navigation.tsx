import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Menu, X } from "lucide-react";

interface NavigationProps {
  onLoginClick: () => void;
  onGetStarted: () => void;
  isLoggedIn?: boolean;
}

export function Navigation({ onLoginClick, onGetStarted, isLoggedIn = false }: NavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-black/80 backdrop-blur-md py-4" : "bg-transparent py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div 
            className="text-2xl font-bold cursor-pointer" 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <span className="text-white">Quote</span>
            <span className="text-[#00ff88]">Maker</span>
          </div>

          {/* Desktop Navigation - Right aligned with menu items */}
          <div className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => scrollToSection('features')} 
              className="text-gray-300 hover:text-white transition-colors"
            >
              기능
            </button>
            <button 
              onClick={() => scrollToSection('pricing')} 
              className="text-gray-300 hover:text-white transition-colors"
            >
              요금제
            </button>
            <button 
              onClick={() => scrollToSection('sample')} 
              className="text-gray-300 hover:text-white transition-colors"
            >
              예시
            </button>
            
            {/* Action Buttons */}
            {isLoggedIn ? (
              <Button
                onClick={onGetStarted}
                className="bg-[#00ff88] text-black hover:bg-[#00cc6a]"
              >
                대시보드로 이동
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={onLoginClick}
                  className="text-white hover:text-[#00ff88] hover:bg-white/10"
                >
                  로그인
                </Button>
                <Button
                  onClick={onGetStarted}
                  className="bg-[#00ff88] text-black hover:bg-[#00cc6a]"
                >
                  지금 시작하기
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white p-2"
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-black/95 backdrop-blur-md border-t border-white/10 p-6 flex flex-col gap-4">
          <button 
            onClick={() => scrollToSection('features')} 
            className="text-left text-lg text-gray-300 hover:text-white py-2"
          >
            기능
          </button>
          <button 
            onClick={() => scrollToSection('pricing')} 
            className="text-left text-lg text-gray-300 hover:text-white py-2"
          >
            요금제
          </button>
          <button 
            onClick={() => scrollToSection('sample')} 
            className="text-left text-lg text-gray-300 hover:text-white py-2"
          >
            예시
          </button>
          <div className="h-px bg-white/10 my-2" />
          {isLoggedIn ? (
            <Button
              onClick={() => {
                onGetStarted();
                setIsMobileMenuOpen(false);
              }}
              className="bg-[#00ff88] text-black hover:bg-[#00cc6a]"
            >
              대시보드로 이동
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                onClick={() => {
                  onLoginClick();
                  setIsMobileMenuOpen(false);
                }}
                className="justify-start text-white hover:text-[#00ff88] hover:bg-white/10"
              >
                로그인
              </Button>
              <Button
                onClick={() => {
                  onGetStarted();
                  setIsMobileMenuOpen(false);
                }}
                className="bg-[#00ff88] text-black hover:bg-[#00cc6a]"
              >
                지금 시작하기
              </Button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
