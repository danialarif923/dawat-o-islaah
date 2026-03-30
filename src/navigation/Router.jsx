import { StrictMode } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { LanguageProvider } from "../context/LanguageContext";
import Home from "../pages/home";
import SignUp from "../pages/auth/SignUp";
import ForgotPassword from "../pages/auth/ForgetPassword";
import ChangePassword from "../pages/auth/ChangePassword";
import { WithHeroLayout, WithoutHeroLayout } from "./Outlet";
import HadithBookChapters from "../pages/hadith/HadithBookChapters";
import Quran from "../pages/quran";
import Surah from "../pages/quran/surah";
import Juz from "../pages/quran/juz";
import Hadith from "../pages/hadith";
import HadithList from "../pages/hadith/HadithList";
import { ScrollToTopWrapper } from "../utils/ScrollToTop";
import ZakatCalculator from "../pages/IslamicTools/ZakatCalculator";
import InheritanceCalculator from "../pages/IslamicTools/InheritanceCalculator";
import PrayerTimings from "../pages/IslamicTools/PrayerTimings";
import QiblaDirection from "../pages/IslamicTools/QiblaDirection";
import NearestMosquesMap from "../pages/IslamicTools/NearestMosque";
import IslamicBooks from "../pages/islamicBooks";
import Masail from "../pages/masail";
import { BookProvider } from "../context/BookContext";
import { MasailProvider } from "../context/MasailContext";
import { BlogProvider } from "../context/BlogContext";
import BlogDetail from "../pages/blog";
import SignIn from "../pages/auth/SignIn";
import SetNewPassword from "../pages/auth/SetNewPassword";
import { useAuthData } from "../context/AuthContext";
import QuestionsPage from "../pages/qna/QuestionsPage";
import Search from "../pages/search";
import { QNAProvider } from "../context/QnaContext";
import { Toaster } from "react-hot-toast";
import NotFound from "../components/AppComponents/NotFound";
import DiscussionForum from "../pages/DiscussionForum/DiscussionForum";
import Navbar from "../components/AppComponents/Header/MenuItems/navbar";
import Settings from "../pages/settings/Settings";
export default function Router() {
  const { isAuthenticated } = useAuthData();

  return (
    <StrictMode>
      <BrowserRouter>
        <LanguageProvider>
          <ScrollToTopWrapper>
            <BlogProvider>
              <BookProvider>
                <MasailProvider>
                  <QNAProvider>
                    <Toaster />
                    <Routes>
                      <Route path="/" element={<WithHeroLayout />}>
                        <Route index element={<Home />} />
                        <Route path="quran" element={<Quran />} />
                        <Route path="surah/:surahNumber" element={<Surah />} />
                        <Route path="juz/:juzNumber" element={<Juz />} />
                        <Route path="hadith" element={<Hadith />} />
                        <Route
                          path="hadith/:bookSlug"
                          element={<HadithBookChapters />}
                        />
                        <Route
                          path="hadith/:bookSlug/:chapterNo"
                          element={<HadithList />}
                        />
                        <Route path="blog/:blogid" element={<BlogDetail />} />
                        <Route path="search" element={<Search />} />
                      </Route>
                      <Route path="/" element={<WithoutHeroLayout />}>
                        <Route
                          path="zakat-calculator"
                          element={<ZakatCalculator />}
                        />
                        <Route
                          path="inheritance-calculator"
                          element={<InheritanceCalculator />}
                        />
                        <Route
                          path="prayer-timings"
                          element={<PrayerTimings />}
                        />
                        <Route
                          path="qibla-direction"
                          element={<QiblaDirection />}
                        />
                        <Route path="islamicBooks" element={<IslamicBooks />} />
                        <Route path="masail" element={<Masail />} />

                        {/* ✅ ADD THIS LINE HERE */}
                        <Route
                          path="discussion-forum"
                          element={<DiscussionForum />}
                        />

                        {/* Keep private routes logic */}
                        {isAuthenticated && (
                          <Route
                            path="questions-and-answers"
                            element={<QuestionsPage />}
                          />
                        )}
                      </Route>
                      <Route>
                        <Route path="/signin" element={<SignIn />} />
                        <Route path="/signup" element={<SignUp />} />
                        <Route
                          path="/forget-password"
                          element={<ForgotPassword />}
                        />
                        <Route
                          path="/change-password"
                          element={<ChangePassword />}
                        />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/navbar" element={<Navbar />} />
                        <Route
                          path="/set-new-password"
                          element={<SetNewPassword />}
                        />
                        <Route path="*" element={<NotFound />} />
                      </Route>
                    </Routes>
                  </QNAProvider>
                </MasailProvider>
              </BookProvider>
            </BlogProvider>
          </ScrollToTopWrapper>
        </LanguageProvider>
      </BrowserRouter>
    </StrictMode>
  );
}
