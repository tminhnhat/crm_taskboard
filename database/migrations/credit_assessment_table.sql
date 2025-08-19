-- Create schema if not exists
CREATE SCHEMA IF NOT EXISTS dulieu_congviec;

-- Create enum for assessment status
CREATE TYPE dulieu_congviec.assessment_status AS ENUM ('draft', 'pending', 'approved', 'rejected');

-- Main credit assessment table
CREATE TABLE dulieu_congviec.credit_assessments (
    assessment_id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES dulieu_congviec.customers(customer_id),
    staff_id INTEGER REFERENCES dulieu_congviec.staff(staff_id),
    product_id INTEGER REFERENCES dulieu_congviec.products(product_id),
    status dulieu_congviec.assessment_status DEFAULT 'draft',
    
    -- Basic information
    department VARCHAR(100),
    department_head VARCHAR(100),
    fee_amount DECIMAL(15,0),
    approval_decision VARCHAR(100),

    -- Loan information as JSON
    loan_info JSONB DEFAULT '{}'::jsonb,
    /*
    loan_info structure:
    {
        "loan_type": {
            "category": string,              -- vd: "business", "consumer", "mortgage", "credit_card"
            "product_code": string,          -- Mã sản phẩm vay
            "product_name": string           -- Tên sản phẩm vay
        },
        "purpose": {
            "main_purpose": string,          -- Mục đích vay chính
            "sub_purpose": string,           -- Mục đích vay chi tiết
            "description": string            -- Mô tả chi tiết mục đích sử dụng vốn
        },
        "amount": {
            "requested": number,             -- Số tiền đề nghị vay
            "approved": number,              -- Số tiền được phê duyệt
            "disbursement": number           -- Số tiền giải ngân
        },
        "term": {
            "requested_months": number,      -- Thời hạn đề nghị vay (tháng)
            "approved_months": number,       -- Thời hạn được duyệt (tháng)
            "grace_period_months": number    -- Thời gian ân hạn (tháng)
        },
        "interest": {
            "base_rate": number,            -- Lãi suất cơ sở (%)
            "margin": number,               -- Biên độ (%)
            "final_rate": number,           -- Lãi suất áp dụng (%)
            "type": string,                 -- Loại lãi suất (cố định/thả nổi)
            "adjustment_period": number      -- Kỳ điều chỉnh lãi suất (tháng)
        },
        "collateral": {
            "type": string,                 -- Hình thức đảm bảo
            "required": boolean,            -- Yêu cầu TSBĐ
            "assets": [
                {
                    "type": string,         -- Loại tài sản
                    "description": string,   -- Mô tả tài sản
                    "owner": string,         -- Chủ sở hữu
                    "value_market": number,  -- Giá trị thị trường
                    "value_accepted": number -- Giá trị được chấp nhận
                }
            ],
            "total_value": number,          -- Tổng giá trị TSBĐ
            "ltv_ratio": number             -- Tỷ lệ cho vay/GTTS (%)
        },
        "payment": {
            "method": string,               -- Phương thức trả nợ
            "frequency": string,            -- Kỳ hạn trả nợ
            "monthly_amount": number,       -- Số tiền trả hàng tháng
            "grace_enddate": string         -- Ngày kết thúc ân hạn
        },
        "fees": [
            {
                "name": string,             -- Tên loại phí
                "amount": number,           -- Số tiền
                "calculation": string,      -- Cách tính
                "payment_method": string    -- Phương thức thu
            }
        ],
        "insurance": {
            "required": boolean,            -- Yêu cầu bảo hiểm
            "types": [
                {
                    "name": string,         -- Loại bảo hiểm
                    "company": string,      -- Công ty bảo hiểm
                    "amount": number,       -- Số tiền bảo hiểm
                    "term_months": number   -- Thời hạn (tháng)
                }
            ]
        }
    }
    */

    -- Business plan data (PAKD) as JSON
    business_plan JSONB DEFAULT '{}'::jsonb,
    /*
    business_plan structure:
    {
        "pakd_doanhthu": number,
        "pakd_giavon": number,
        "pakd_nhancong": number,
        "pakd_chiphikhac": number,
        "pakd_laivay": number,
        "pakd_thue": number,
        "pakd_loinhuansauthue": number,
        "pakd_tongchiphi": number,
        "pakd_vongquay": number,
        "pakd_nhucauvon": number,
        "pakd_vontuco": number,
        "pakd_vaytctdkhac": number,
        "pakd_vaynhct": number
    }
    */

    -- Financial reports data (BCTC) as JSON
    financial_reports JSONB DEFAULT '{}'::jsonb,
    /*
    financial_reports structure:
    {
        "nam_0": {
            "title": number,
            "tongtaisan": number,
            "taisannganhang": number,
            "tien": number,
            "phaithu": number,
            "tonkho": number,
            "tscd": number,
            "tongnguonvon": number,
            "notranguoiban": number,
            "nonhct": number,
            "notctd": number,
            "nodaihan": number,
            "voncsh": number,
            "doanhthu": number,
            "giavon": number,
            "chingoaigiavon": number,
            "thue": number,
            "laivay": number,
            "loinhuan": number
        },
        "nam_1": {...},
        "nam_2": {...}
    }
    */

    -- Assessment details as JSON
    assessment_details JSONB DEFAULT '{}'::jsonb,
    /*
    assessment_details structure:
    {
        "danhgiathongtintaichinh": {
            "checked": boolean,
            "keyword": string,
            "content": string
        },
        "danhgiapakd": {...},
        "linhvuc_kinhnghiemsxkd": {...},
        "phuongthuchoatdongsxkd": {...},
        "cosovatchatthietbi": {...},
        "diadiemkinhdoanh": {...},
        "danhgiaquymo": {...},
        "danhgianangluctochuckd": {...},
        "danhgianguonlaodong": {...},
        "danhgianguyenlieudauvao": {...},
        "nhacungcapdauvao": {...},
        "mucdophuthuocnhacungcap": {...},
        "danhgiathitruongtieuthu": {...},
        "danhgialoiich": {...},
        "danhgiaruiro": {...},
        "bienphapkiemsoatruiro": {...}
    }
    */

    -- Metadata, borrower and spouse information
    metadata JSONB DEFAULT '{}'::jsonb,
    /*
    metadata structure including borrower and spouse information:
    {
        "borrower": {
            "full_name": string,
            "birth_date": string,
            "gender": string,
            "id_number": string,
            "id_issue_date": string,
            "id_issue_place": string,
            "phone": string,
            "email": string,
            "marital_status": string,
            "education_level": string,
            "current_address": string,
            "permanent_address": string,
            "residence_status": string,
            "residence_time_years": number,
            
            "occupation": string,
            "workplace": string,
            "position": string,
            "work_experience_years": number,
            "income": {
                "salary_monthly": number,
                "business_monthly": number,
                "other_monthly": number,
                "total_monthly": number
            },
            
            "assets": [
                {
                    "type": string,
                    "description": string,
                    "value": number,
                    "ownership_type": string,
                    "collateral_status": boolean,
                    "registration_number": string
                }
            ],
            
            "business_info": {
                "personal_tax_number": string,
                "business_registration": {
                    "number": string,
                    "date": string,
                    "place": string,
                    "business_type": string,
                    "business_sector": string,
                    "employee_count": number,
                    "business_locations": [
                        {
                            "address": string,
                            "ownership": string,
                            "area": number
                        }
                    ]
                },
                "business_experience_years": number,
                "business_partners": [
                    {
                        "name": string,
                        "relationship": string,
                        "cooperation_time_years": number
                    }
                ]
            },

            "credit_history": {
                "credit_score": number,
                "existing_loans": [
                    {
                        "bank": string,
                        "product": string,
                        "original_amount": number,
                        "current_balance": number,
                        "monthly_payment": number,
                        "start_date": string,
                        "end_date": string,
                        "collateral": string,
                        "status": string
                    }
                ],
                "credit_cards": [
                    {
                        "bank": string,
                        "limit": number,
                        "current_balance": number,
                        "status": string
                    }
                ]
            }
        },
        
        "spouse": {
            "full_name": string,
            "birth_date": string,
            "id_number": string,
            "id_issue_date": string,
            "id_issue_place": string,
            "phone": string,
            "current_address": string,
            "permanent_address": string,
            "occupation": string,
            "workplace": string,
            "position": string,
            "income_monthly": number,
            "assets": [
                {
                    "type": string,
                    "description": string,
                    "value": number,
                    "ownership_type": string
                }
            ],
            "personal_tax_number": string,
            "business_registration": {
                "number": string,
                "date": string,
                "place": string,
                "business_type": string,
                "business_sector": string
            }
        }
    }
    */
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger for updating updated_at
CREATE OR REPLACE FUNCTION dulieu_congviec.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_credit_assessments_updated_at
    BEFORE UPDATE ON dulieu_congviec.credit_assessments
    FOR EACH ROW
    EXECUTE FUNCTION dulieu_congviec.update_updated_at_column();

-- Indexes
CREATE INDEX idx_credit_assessments_customer ON dulieu_congviec.credit_assessments(customer_id);
CREATE INDEX idx_credit_assessments_staff ON dulieu_congviec.credit_assessments(staff_id);
CREATE INDEX idx_credit_assessments_product ON dulieu_congviec.credit_assessments(product_id);
CREATE INDEX idx_credit_assessments_status ON dulieu_congviec.credit_assessments(status);

-- GIN indexes for JSON fields to enable efficient searching within JSON data
CREATE INDEX idx_credit_assessments_business_plan ON dulieu_congviec.credit_assessments USING GIN (business_plan);
CREATE INDEX idx_credit_assessments_financial_reports ON dulieu_congviec.credit_assessments USING GIN (financial_reports);
CREATE INDEX idx_credit_assessments_assessment_details ON dulieu_congviec.credit_assessments USING GIN (assessment_details);
CREATE INDEX idx_credit_assessments_metadata ON dulieu_congviec.credit_assessments USING GIN (metadata);

-- Grant permissions
GRANT USAGE ON SCHEMA dulieu_congviec TO authenticator, authenticated, anon, postgres;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA dulieu_congviec TO authenticator, authenticated, anon, postgres;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA dulieu_congviec TO authenticator, authenticated, anon, postgres;

-- Example queries:

-- 1. Get all assessments with revenue > 1000000000
/*
SELECT * FROM dulieu_congviec.credit_assessments 
WHERE (business_plan->>'pakd_doanhthu')::numeric > 1000000000;
*/

-- 2. Get assessments with specific financial ratio in year 0
/*
SELECT 
    id,
    customer_id,
    (financial_reports->'nam_0'->>'tongtaisan')::numeric / 
    NULLIF((financial_reports->'nam_0'->>'tongnguonvon')::numeric, 0) as assets_ratio
FROM dulieu_congviec.credit_assessments
WHERE financial_reports->'nam_0'->>'tongtaisan' IS NOT NULL;
*/

-- 3. Search assessments by keywords in any assessment detail
/*
SELECT * FROM dulieu_congviec.credit_assessments 
WHERE assessment_details @> '{"danhgiathongtintaichinh": {"keyword": "tốt"}}'::jsonb;
*/

-- 4. Update specific financial report field
/*
UPDATE dulieu_congviec.credit_assessments
SET financial_reports = jsonb_set(
    financial_reports,
    '{nam_0,doanhthu}',
    '1000000000'
)
WHERE id = 'some-uuid';
*/
