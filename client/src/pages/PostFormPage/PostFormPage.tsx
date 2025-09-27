import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { newsAPI } from '../../services/api';
import type { Post, PostCreateRequest, PostUpdateRequest } from '../../types';
import './PostFormPage.css';
import Loading from '../../components/Loading/Loading';
import Error from '../../components/Error/Error';
import { useAuth } from '../../contexts/AuthContext';

interface FormValues {
    header: string; // renamed from title
    content: string;
    excerpt?: string;
    category: string;
    is_published: boolean;
    is_featured: boolean;
}

const validationSchema = Yup.object({
    header: Yup.string() // renamed from title
        .required('The header is required')
        .min(1, 'The header must be at least 1 character long')
        .max(255, 'The header cannot exceed 255 characters'),
    content: Yup.string()
        .required('The content is required')
        .min(1, 'The content must be at least 1 character long'),
    excerpt: Yup.string()
        .max(300, 'The excerpt cannot exceed 300 characters'),
    category: Yup.string()
        .required('Category is required'),
    is_published: Yup.boolean()
        .required('Publish setting is required'),
    is_featured: Yup.boolean()
        .required('Featured setting is required'),
});

const PostFormPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEditMode = Boolean(id);
    
    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState<boolean>(isEditMode);
    const [error, setError] = useState<string>('');

    const { categories } = useAuth();

    useEffect(() => {
        if (isEditMode && id) {
            const fetchPost = async () => {
                try {
                    const fetchedPost = await newsAPI.getPostById(id);
                    setPost(fetchedPost);
                } catch (err) {
                    setError('Error fetching post for editing');
                    console.error('Error fetching post:', err);
                } finally {
                    setLoading(false);
                }
            };

            fetchPost();
        }
    }, [id, isEditMode]);

    const handleSubmit = async (values: FormValues, { setSubmitting }: any) => {
        try {
            if (isEditMode && id) {
                
                const updateData: PostUpdateRequest = {};
                if (values.header !== post?.header) updateData.header = values.header;
                if (values.content !== post?.content) updateData.content = values.content;
                if (values.excerpt !== post?.excerpt) updateData.excerpt = values.excerpt;
                if (values.category !== post?.category) updateData.category = values.category;
                if (values.is_published !== post?.is_published) updateData.is_published = values.is_published;
                if (values.is_featured !== post?.is_featured) updateData.is_featured = values.is_featured;
                
                await newsAPI.updatePost(id, updateData);
            } else {
                const createData: PostCreateRequest = {
                    header: values.header,
                    content: values.content,
                    excerpt: values.excerpt,
                    category: values.category,
                    is_published: values.is_published,
                    is_featured: values.is_featured,
                };
                await newsAPI.createPost(createData);
            }
            
            navigate('/');
        } catch (err) {
            console.error('Error saving post:', err);
            setError(isEditMode ? 'Error updating post' : 'Error creating post');
        } finally {
            setSubmitting(false);
        }
    };

    const initialValues: FormValues = {
        header: post?.header || '',
        content: post?.content || '',
        excerpt: post?.excerpt || '',
        category: post?.category || '',
        is_published: post?.is_published ?? true,
        is_featured: post?.is_featured ?? false,
    };

    if (loading) return <Loading />;

    return (
        <div className="post-form-page">
            <div className="post-form__header">
                <h1>{isEditMode ? 'Edit Post' : 'Create Post'}</h1>
                <Link to="/" className="btn btn--secondary">
                    ← Back to list
                </Link>
            </div>

            {error && <Error message={error} />}

            <div className="post-form__content">
                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                    enableReinitialize={true}
                >
                    {({ isSubmitting }) => (
                        <Form className="post-form">
                            <div className="form-group">
                                <label htmlFor="header" className="form-label">
                                    Post Header *
                                </label>
                                <Field
                                    type="text"
                                    id="header"
                                    name="header"
                                    className="form-input"
                                    placeholder="Enter post header"
                                />
                                <ErrorMessage 
                                    name="header" 
                                    component="div" 
                                    className="form-error" 
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="excerpt" className="form-label">
                                    Post Excerpt
                                </label>
                                <Field
                                    type="text"
                                    id="excerpt"
                                    name="excerpt"
                                    className="form-input"
                                    placeholder="Brief description of the post (optional)"
                                />
                                <ErrorMessage 
                                    name="excerpt" 
                                    component="div" 
                                    className="form-error" 
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="content" className="form-label">
                                    Post Content *
                                </label>
                                <Field
                                    as="textarea"
                                    id="content"
                                    name="content"
                                    className="form-textarea"
                                    placeholder="Enter post content"
                                    rows={10}
                                />
                                <ErrorMessage 
                                    name="content" 
                                    component="div" 
                                    className="form-error" 
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="category" className="form-label">
                                    Category *
                                </label>
                                <Field
                                    as="select"
                                    id="category"
                                    name="category"
                                    className="form-select"
                                >
                                    <option value="">Select category</option>
                                    {categories.filter(c => c.name !== 'ALL').map((category) => (
                                        <option key={category.id} value={category.slug}>
                                            {category.name}
                                        </option>
                                    ))}
                                </Field>
                                <ErrorMessage 
                                    name="category" 
                                    component="div" 
                                    className="form-error" 
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label checkbox-label">
                                    Publish this post
                                    <Field
                                        type="checkbox"
                                        name="is_published"
                                        className="form-checkbox"
                                    />
                                </label>
                                <div className="form-help">
                                    Published posts are visible to all users
                                </div>
                                <ErrorMessage 
                                    name="is_published" 
                                    component="div" 
                                    className="form-error" 
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label checkbox-label">
                                    Feature this post
                                    <Field
                                        type="checkbox"
                                        name="is_featured"
                                        className="form-checkbox"
                                    />
                                </label>
                                <div className="form-help">
                                    Featured posts are highlighted on the homepage
                                </div>
                                <ErrorMessage 
                                    name="is_featured" 
                                    component="div" 
                                    className="form-error" 
                                />
                            </div>

                            <div className="form-actions">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="btn btn--primary"
                                >
                                    {isSubmitting 
                                        ? (isEditMode ? 'Saving...' : 'Creating...')
                                        : (isEditMode ? 'Save changes' : 'Create post')
                                    }
                                </button>
                                <Link 
                                    to={isEditMode && post ? `/post/${post.id}` : '/'}
                                    className="btn btn--secondary"
                                >
                                    Cancel
                                </Link>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
};

export default PostFormPage;
