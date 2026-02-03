import React, { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FileText, Upload, Search, User, Book, TrendingUp, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { supabase } from '@/lib/supabase';
import UploadForm from '@/components/UploadForm';
import SearchForm from '@/components/SearchForm';
import DocumentList from '@/components/DocumentList';
import RecordCertificate from '@/components/RecordCertificate';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { setCurrentView, user, userProfile, authInitialized, isLoading } = useAppContext();
  const navigate = useNavigate();
  
  // View states
  const [showUpload, setShowUpload] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  
  // Data states
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [myDocuments, setMyDocuments] = useState<any[]>([]);
  const [uploadedDocument, setUploadedDocument] = useState<any>(null);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [documentStats, setDocumentStats] = useState({ 
    total: 0, 
    public: 0, 
    private: 0, 
    lastRecorded: null as Date | null 
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  // Load documents function
  const loadMyDocuments = useCallback(async () => {
    if (!user) {
      console.log('Dashboard: No user, skipping document load');
      return;
    }

    console.log('Dashboard: Loading documents for user:', user.id);
    setLoadingDocuments(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Dashboard: Error fetching documents:', fetchError);
        throw fetchError;
      }

      console.log('Dashboard: Loaded', data?.length || 0, 'documents');
      setMyDocuments(data || []);

      // Calculate statistics
      const total = data?.length || 0;
      const publicDocs = data?.filter(doc => doc.is_public).length || 0;
      const privateDocs = total - publicDocs;
      const lastRecorded = data && data.length > 0 ? new Date(data[0].created_at) : null;

      setDocumentStats({
        total,
        public: publicDocs,
        private: privateDocs,
        lastRecorded
      });

      // Create recent activity
      const activities = (data || []).slice(0, 5).map(doc => ({
        type: 'upload',
        message: `Uploaded: ${doc.title}`,
        date: new Date(doc.created_at)
      }));
      setRecentActivity(activities);
    } catch (err: any) {
      console.error('Dashboard: Failed to load documents:', err);
      setError('Failed to load documents. Please try again.');
    } finally {
      setLoadingDocuments(false);
    }
  }, [user]);

  // Redirect if not authenticated
  useEffect(() => {
    if (authInitialized && !user) {
      console.log('Dashboard: Not authenticated, redirecting to login');
      navigate('/login', { replace: true });
    }
  }, [authInitialized, user, navigate]);

  // Set current view
  useEffect(() => {
    setCurrentView('dashboard');
  }, [setCurrentView]);

  // Load documents when user is available and we're on dashboard view
  useEffect(() => {
    if (user && !showUpload && !showSearch && !showCertificate) {
      loadMyDocuments();
    }
  }, [user, showUpload, showSearch, showCertificate, loadMyDocuments]);

  const handleViewProfile = () => {
    setCurrentView('profile');
    navigate('/profile');
  };

  const handleUpload = () => {
    setCurrentView('upload');
    setShowUpload(true);
    setShowSearch(false);
    setShowCertificate(false);
  };

  const handleSearch = () => {
    setCurrentView('search');
    setShowSearch(true);
    setShowUpload(false);
    setShowCertificate(false);
  };

  const handleKnowledgeBase = () => {
    setCurrentView('knowledge-base');
    navigate('/knowledge-base');
  };

  const handleUploadComplete = (document: any) => {
    setUploadedDocument(document);
    setShowUpload(false);
    setShowCertificate(true);
    // Document will reload when we return to dashboard
  };

  const handleSearchResults = (documents: any[]) => {
    setSearchResults(documents);
  };

  const handleViewCertificate = (document: any) => {
    setSelectedDocument(document);
    setShowCertificate(true);
  };

  const handleBackFromCertificate = () => {
    setShowCertificate(false);
    setSelectedDocument(null);
    setUploadedDocument(null);
    setCurrentView('dashboard');
    // Documents will reload via useEffect
  };

  const handleDocumentDeleted = useCallback(() => {
    // Reload documents immediately after deletion
    loadMyDocuments();
  }, [loadMyDocuments]);

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const displayName = userProfile?.full_name || userProfile?.display_name || user?.email || 'User';

  // Show loading screen while auth is initializing or loading
  if (!authInitialized || isLoading) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50 p-4 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4" />
            <p className="text-slate-600">Loading...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  // If no user after auth initialization, show redirect message
  if (!user) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50 p-4 flex items-center justify-center">
          <div className="text-center">
            <p className="text-slate-600">Redirecting to login...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (showCertificate && (uploadedDocument || selectedDocument)) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50 p-4">
          <div className="container mx-auto max-w-4xl">
            <RecordCertificate 
              document={uploadedDocument || selectedDocument} 
              onBack={handleBackFromCertificate} 
            />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (showUpload) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50 p-4">
          <div className="container mx-auto max-w-4xl">
            <div className="mb-6">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowUpload(false);
                  setCurrentView('dashboard');
                }}
                className="mb-4"
              >
                ← Back to Dashboard
              </Button>
            </div>
            <UploadForm onUploadComplete={handleUploadComplete} />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (showSearch) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50 p-4">
          <div className="container mx-auto max-w-4xl">
            <div className="mb-6">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowSearch(false);
                  setCurrentView('dashboard');
                }}
                className="mb-4"
              >
                ← Back to Dashboard
              </Button>
            </div>
            <SearchForm onSearchResults={handleSearchResults} />
            {searchResults.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Search Results ({searchResults.length})</h3>
                <DocumentList 
                  documents={searchResults} 
                  onViewCertificate={handleViewCertificate}
                  showOwnerActions={false}
                />
              </div>
            )}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50 p-4">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard</h1>
            <p className="text-slate-600">Manage your recorded documents</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <Avatar className="h-20 w-20 mx-auto mb-4">
                    {userProfile?.profile_image_url && (
                      <AvatarImage 
                        src={userProfile.profile_image_url} 
                        alt={displayName}
                        key={userProfile.profile_image_url}
                      />
                    )}
                    <AvatarFallback className="bg-slate-900 text-white text-xl">
                      {getInitials(displayName)}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold text-lg mb-2">{displayName}</h3>
                  <p className="text-sm text-slate-600 mb-4">{user?.email}</p>
                  <Button 
                    variant="outline" 
                    className="w-full border-amber-600 text-amber-600 hover:bg-amber-600 hover:text-white"
                    onClick={handleViewProfile}
                  >
                    Edit Profile
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 gap-6">
                {/* My Ledger Summary Card */}
                <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-amber-900">
                      <TrendingUp className="h-5 w-5" />
                      My Ledger Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-amber-900">{documentStats.total}</div>
                        <div className="text-xs text-slate-600">Total Documents</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{documentStats.public}</div>
                        <div className="text-xs text-slate-600">Public Entries</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{documentStats.private}</div>
                        <div className="text-xs text-slate-600">Private Entries</div>
                      </div>
                    </div>
                    <div className="text-sm text-slate-600 mb-4">
                      <strong>Last Recorded:</strong> {documentStats.lastRecorded 
                        ? documentStats.lastRecorded.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : 'No documents yet'}
                    </div>
                    <Button 
                      className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                      onClick={handleUpload}
                    >
                      Upload New Document
                    </Button>
                    <p className="text-xs text-slate-500 mt-3 text-center">
                      Upload and timestamp your documents to the Sovereign Ledger for proof of record in the private domain.
                    </p>
                  </CardContent>
                </Card>

                {/* Recent Activity Card */}
                <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-900">
                      <Clock className="h-5 w-5" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {recentActivity.length > 0 ? (
                      <div className="space-y-3">
                        {recentActivity.map((activity, index) => (
                          <div key={index} className="flex items-start gap-3 text-sm">
                            {activity.type === 'upload' && <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />}
                            {activity.type === 'delete' && <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />}
                            {activity.type === 'failed' && <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />}
                            <div className="flex-1 min-w-0">
                              <div className="text-slate-700 truncate">{activity.message}</div>
                              <div className="text-xs text-slate-500">
                                {activity.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-slate-500 text-sm">
                        No recent activity
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* Existing action cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Search className="h-5 w-5" />
                        Search Documents
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-600 mb-4">Search your recorded documents</p>
                      <Button 
                        variant="outline" 
                        className="w-full border-amber-600 text-amber-600 hover:bg-amber-600 hover:text-white"
                        onClick={handleSearch}
                      >
                        Search My Documents
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Book className="h-5 w-5" />
                        Knowledge Base
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-600 mb-4">Find answers to common questions</p>
                      <Button 
                        variant="outline" 
                        className="w-full border-amber-600 text-amber-600 hover:bg-amber-600 hover:text-white"
                        onClick={handleKnowledgeBase}
                      >
                        View FAQ
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                My Documents ({myDocuments.length})
                {loadingDocuments && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-600 ml-2" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {error ? (
                <div className="text-center py-8">
                  <p className="text-red-600 mb-4">{error}</p>
                  <Button 
                    onClick={() => loadMyDocuments()}
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    Try Again
                  </Button>
                </div>
              ) : loadingDocuments ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto mb-4" />
                  <p className="text-slate-600">Loading documents...</p>
                </div>
              ) : myDocuments.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600 mb-4">No documents recorded yet</p>
                  <Button 
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                    onClick={handleUpload}
                  >
                    Record Your First Document
                  </Button>
                </div>
              ) : (
                <DocumentList 
                  documents={myDocuments} 
                  onViewCertificate={handleViewCertificate}
                  onDocumentDeleted={handleDocumentDeleted}
                  showOwnerActions={true}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;