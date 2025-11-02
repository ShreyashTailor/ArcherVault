import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Edit, Upload, Link } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Resource } from "@shared/schema";

const getResourceLinkText = (type: 'pdf' | 'book' | 'note'): string => {
  switch (type) {
    case 'pdf': return 'View PDF';
    case 'book': return 'View Book';
    case 'note': return 'View Note';
  }
};

export default function ResourceManagement() {
  const { toast } = useToast();
  const [showAddResource, setShowAddResource] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [type, setType] = useState<'pdf' | 'book' | 'note'>('pdf');
  const [uploadMode, setUploadMode] = useState<'url' | 'upload'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { data: resources = [] } = useQuery<Resource[]>({
    queryKey: ['/api/admin/resources'],
  });

  const createResourceMutation = useMutation({
    mutationFn: async (data: { title: string; description: string; url: string; type: string }) => {
      await apiRequest('POST', '/api/admin/resources', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/resources'] });
      resetForm();
      setShowAddResource(false);
      toast({ title: "Resource created successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to create resource", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const updateResourceMutation = useMutation({
    mutationFn: async (data: { id: string; title: string; description: string; url: string; type: string }) => {
      await apiRequest('PUT', `/api/admin/resources/${data.id}`, {
        title: data.title,
        description: data.description,
        url: data.url,
        type: data.type,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/resources'] });
      resetForm();
      setEditingResource(null);
      toast({ title: "Resource updated successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to update resource", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const deleteResourceMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/admin/resources/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/resources'] });
      toast({ title: "Resource deleted successfully" });
    },
  });

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Upload failed');
      }

      const data = await response.json();
      setUrl(data.url);
      toast({ title: "File uploaded successfully" });
    } catch (error: any) {
      toast({ 
        title: "Upload failed", 
        description: error.message,
        variant: "destructive" 
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      handleFileUpload(file);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setUrl("");
    setType('pdf');
    setSelectedFile(null);
    setUploadMode('upload');
  };

  const startEdit = (resource: Resource) => {
    setEditingResource(resource);
    setTitle(resource.title);
    setDescription(resource.description || "");
    setUrl(resource.url);
    setType(resource.type);
    setUploadMode(resource.url ? 'url' : 'upload');
    setShowAddResource(true);
  };

  const cancelEdit = () => {
    setEditingResource(null);
    setShowAddResource(false);
    resetForm();
  };

  const handleSubmit = () => {
    if (!title.trim() || !url.trim()) {
      toast({ 
        title: "Validation Error", 
        description: "Title and URL are required.",
        variant: "destructive" 
      });
      return;
    }

    if (editingResource) {
      updateResourceMutation.mutate({ 
        id: editingResource.id, 
        title, 
        description, 
        url, 
        type 
      });
    } else {
      createResourceMutation.mutate({ title, description, url, type });
    }
  };

  const pdfs = resources.filter(r => r.type === 'pdf');
  const books = resources.filter(r => r.type === 'book');
  const notes = resources.filter(r => r.type === 'note');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Resource Management</h2>
        <Button onClick={() => setShowAddResource(!showAddResource)} data-testid="button-add-resource">
          <Plus className="w-4 h-4 mr-2" />
          Add Resource
        </Button>
      </div>

      {showAddResource && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">{editingResource ? 'Edit Resource' : 'Add New Resource'}</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="resourceType">Type</Label>
              <Select value={type} onValueChange={(v: any) => setType(v)}>
                <SelectTrigger id="resourceType" data-testid="select-resource-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="book">Book</SelectItem>
                  <SelectItem value="note">Note</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="resourceTitle">Title</Label>
              <Input
                id="resourceTitle"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Calculus Textbook, Important Formulas"
                data-testid="input-resource-title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="resourceDescription">Description (Optional)</Label>
              <Textarea
                id="resourceDescription"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the resource"
                data-testid="input-resource-description"
              />
            </div>
            <div className="space-y-2">
              <Label>File Source</Label>
              <Tabs value={uploadMode} onValueChange={(v: any) => setUploadMode(v)}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upload" data-testid="tab-upload">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload File
                  </TabsTrigger>
                  <TabsTrigger value="url" data-testid="tab-url">
                    <Link className="w-4 h-4 mr-2" />
                    Enter URL
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="upload" className="space-y-2 mt-4">
                  <Label htmlFor="resourceFile">
                    Upload {type === 'pdf' ? 'PDF' : type === 'book' ? 'Book' : 'Note'}
                  </Label>
                  <Input
                    id="resourceFile"
                    type="file"
                    accept={type === 'pdf' ? '.pdf' : type === 'book' ? '.pdf,.epub' : '.pdf,.txt,.md'}
                    onChange={handleFileChange}
                    disabled={isUploading}
                    data-testid="input-resource-file"
                  />
                  {isUploading && (
                    <p className="text-sm text-muted-foreground">Uploading to catbox.moe...</p>
                  )}
                  {url && !isUploading && (
                    <p className="text-sm text-primary">✓ File uploaded successfully</p>
                  )}
                </TabsContent>
                <TabsContent value="url" className="space-y-2 mt-4">
                  <Label htmlFor="resourceUrl">
                    {type === 'pdf' ? 'PDF URL' : type === 'book' ? 'Book URL' : 'Note URL'}
                  </Label>
                  <Input
                    id="resourceUrl"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder={
                      type === 'pdf' 
                        ? "https://example.com/document.pdf" 
                        : type === 'book'
                        ? "https://example.com/book.pdf"
                        : "https://example.com/note.pdf"
                    }
                    data-testid="input-resource-url"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter a direct link to a {type === 'pdf' ? 'PDF document' : type === 'book' ? 'book PDF file' : 'note PDF file'}
                  </p>
                </TabsContent>
              </Tabs>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={handleSubmit} 
                disabled={createResourceMutation.isPending || updateResourceMutation.isPending}
                data-testid="button-save-resource"
              >
                {editingResource ? 'Update' : 'Add'} Resource
              </Button>
              <Button variant="outline" onClick={cancelEdit} data-testid="button-cancel-resource">
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-3">
          <h3 className="text-xl font-semibold">PDFs</h3>
          {pdfs.length === 0 ? (
            <Card className="p-6">
              <p className="text-muted-foreground text-center">No PDFs added yet</p>
            </Card>
          ) : (
            pdfs.map((resource) => (
              <Card key={resource.id} className="p-4" data-testid={`resource-card-${resource.id}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-lg" data-testid={`text-resource-title-${resource.id}`}>
                      {resource.title}
                    </h4>
                    {resource.description && (
                      <p className="text-sm text-muted-foreground mt-1" data-testid={`text-resource-description-${resource.id}`}>
                        {resource.description}
                      </p>
                    )}
                    <a 
                      href={resource.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline mt-2 inline-block"
                      data-testid={`link-resource-url-${resource.id}`}
                    >
                      {getResourceLinkText(resource.type)}
                    </a>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => startEdit(resource)}
                      data-testid={`button-edit-resource-${resource.id}`}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => deleteResourceMutation.mutate(resource.id)}
                      data-testid={`button-delete-resource-${resource.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        <div className="space-y-3">
          <h3 className="text-xl font-semibold">Books</h3>
          {books.length === 0 ? (
            <Card className="p-6">
              <p className="text-muted-foreground text-center">No books added yet</p>
            </Card>
          ) : (
            books.map((resource) => (
              <Card key={resource.id} className="p-4" data-testid={`resource-card-${resource.id}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-lg" data-testid={`text-resource-title-${resource.id}`}>
                      {resource.title}
                    </h4>
                    {resource.description && (
                      <p className="text-sm text-muted-foreground mt-1" data-testid={`text-resource-description-${resource.id}`}>
                        {resource.description}
                      </p>
                    )}
                    <a 
                      href={resource.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline mt-2 inline-block"
                      data-testid={`link-resource-url-${resource.id}`}
                    >
                      {getResourceLinkText(resource.type)}
                    </a>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => startEdit(resource)}
                      data-testid={`button-edit-resource-${resource.id}`}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => deleteResourceMutation.mutate(resource.id)}
                      data-testid={`button-delete-resource-${resource.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        <div className="space-y-3">
          <h3 className="text-xl font-semibold">Notes</h3>
          {notes.length === 0 ? (
            <Card className="p-6">
              <p className="text-muted-foreground text-center">No notes added yet</p>
            </Card>
          ) : (
            notes.map((resource) => (
              <Card key={resource.id} className="p-4" data-testid={`resource-card-${resource.id}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-lg" data-testid={`text-resource-title-${resource.id}`}>
                      {resource.title}
                    </h4>
                    {resource.description && (
                      <p className="text-sm text-muted-foreground mt-1" data-testid={`text-resource-description-${resource.id}`}>
                        {resource.description}
                      </p>
                    )}
                    <a 
                      href={resource.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline mt-2 inline-block"
                      data-testid={`link-resource-url-${resource.id}`}
                    >
                      {getResourceLinkText(resource.type)}
                    </a>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => startEdit(resource)}
                      data-testid={`button-edit-resource-${resource.id}`}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => deleteResourceMutation.mutate(resource.id)}
                      data-testid={`button-delete-resource-${resource.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
