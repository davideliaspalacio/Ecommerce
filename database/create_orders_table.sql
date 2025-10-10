-- Crear tabla de órdenes para integración con ePayco
-- Ejecutar este script en tu consola de Supabase

-- Crear tabla de órdenes
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user_email VARCHAR(255) NOT NULL,
    user_name VARCHAR(255),
    user_phone VARCHAR(50),
    
    -- Items de la orden (guardados como JSON)
    items JSONB NOT NULL,
    
    -- Totales
    subtotal DECIMAL(10, 2) NOT NULL,
    tax DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL,
    
    -- Estado de la orden
    status VARCHAR(50) NOT NULL DEFAULT 'pending' 
        CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    
    -- Información de pago
    payment_method VARCHAR(50) NOT NULL DEFAULT 'epayco'
        CHECK (payment_method IN ('epayco', 'whatsapp', 'other')),
    payment_status VARCHAR(50) NOT NULL DEFAULT 'pending'
        CHECK (payment_status IN ('pending', 'approved', 'rejected', 'cancelled')),
    
    -- Información de ePayco
    epayco_transaction_id VARCHAR(255),
    epayco_ref_payco VARCHAR(255),
    epayco_response JSONB,
    
    -- Notas adicionales
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_epayco_ref_payco ON orders(epayco_ref_payco);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para actualizar updated_at
DROP TRIGGER IF EXISTS orders_updated_at_trigger ON orders;
CREATE TRIGGER orders_updated_at_trigger
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_orders_updated_at();

-- Habilitar RLS (Row Level Security)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver sus propias órdenes
CREATE POLICY "Users can view their own orders"
    ON orders
    FOR SELECT
    USING (auth.uid() = user_id);

-- Política: Los usuarios pueden crear sus propias órdenes
CREATE POLICY "Users can create their own orders"
    ON orders
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios pueden actualizar sus propias órdenes pendientes
CREATE POLICY "Users can update their own pending orders"
    ON orders
    FOR UPDATE
    USING (auth.uid() = user_id AND status = 'pending');

-- Política: Los administradores pueden ver todas las órdenes
-- (Nota: Necesitarás ajustar esto según tu sistema de roles)
-- CREATE POLICY "Admins can view all orders"
--     ON orders
--     FOR ALL
--     USING (auth.jwt() ->> 'role' = 'admin');

-- Comentarios sobre la tabla
COMMENT ON TABLE orders IS 'Tabla de órdenes de compra con integración de ePayco';
COMMENT ON COLUMN orders.items IS 'JSON array con los productos de la orden';
COMMENT ON COLUMN orders.epayco_response IS 'Respuesta completa de ePayco en formato JSON';

